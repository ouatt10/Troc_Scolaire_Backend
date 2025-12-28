// src/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Obtenir toutes les conversations de l'utilisateur
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Récupérer tous les messages de l'utilisateur
    const messages = await Message.find({
      $or: [
        { expediteur: userId },
        { destinataire: userId }
      ]
    })
      .populate('expediteur', 'nom prenom avatar')
      .populate('destinataire', 'nom prenom avatar')
      .sort({ dateEnvoi: -1 });

    // Grouper par conversation
    const conversationsMap = new Map();

    messages.forEach(message => {
      const convId = message.conversation;
      
      if (!conversationsMap.has(convId)) {
        // Déterminer l'autre utilisateur
        const autreUser = message.expediteur._id.toString() === userId
          ? message.destinataire
          : message.expediteur;

        conversationsMap.set(convId, {
          conversationId: convId,
          autreUser: {
            id: autreUser._id,
            nom: autreUser.nom,
            prenom: autreUser.prenom,
            avatar: autreUser.avatar
          },
          dernierMessage: message.contenu,
          dateDernierMessage: message.dateEnvoi,
          nonLu: 0,
          messages: []
        });
      }

      // Compter les messages non lus
      if (message.destinataire._id.toString() === userId && !message.lu) {
        conversationsMap.get(convId).nonLu++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Obtenir les messages d'une conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('expediteur', 'nom prenom avatar')
      .populate('destinataire', 'nom prenom avatar')
      .sort({ dateEnvoi: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ conversation: conversationId });

    res.json({
      success: true,
      data: messages.reverse(), // Inverser pour avoir les plus anciens en premier
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
});

// @route   POST /api/messages
// @desc    Envoyer un message (via HTTP, pas Socket.IO)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { destinataire, contenu, annonceId } = req.body;

    if (!destinataire || !contenu) {
      return res.status(400).json({
        success: false,
        message: 'Destinataire et contenu requis'
      });
    }

    const conversationId = Message.createConversationId(req.user._id, destinataire);

    const message = await Message.create({
      conversation: conversationId,
      expediteur: req.user._id,
      destinataire,
      contenu,
      annonce: annonceId || null
    });

    await message.populate('expediteur', 'nom prenom avatar');
    await message.populate('destinataire', 'nom prenom avatar');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
});

// @route   PUT /api/messages/:conversationId/mark-read
// @desc    Marquer les messages d'une conversation comme lus
// @access  Private
router.put('/:conversationId/mark-read', protect, async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        destinataire: req.user._id,
        lu: false
      },
      {
        $set: {
          lu: true,
          dateLecture: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    console.error('Erreur marquage messages lus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages'
    });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Obtenir le nombre de messages non lus
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      destinataire: req.user._id,
      lu: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Erreur comptage messages non lus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des messages'
    });
  }
});

module.exports = router;