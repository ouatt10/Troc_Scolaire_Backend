// src/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/:id
// @desc    Obtenir le profil public d'un utilisateur
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les annonces actives de l'utilisateur
    const annonces = await Annonce.find({
      auteur: req.params.id,
      statut: 'active'
    }).select('titre prix categorie niveau images createdAt');

    res.json({
      success: true,
      data: {
        user,
        annonces
      }
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

// @route   GET /api/users/me/favoris
// @desc    Obtenir les annonces favorites de l'utilisateur connecté
// @access  Private
router.get('/me/favoris', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'annoncesFavorites',
      populate: {
        path: 'auteur',
        select: 'nom prenom ville avatar'
      }
    });

    res.json({
      success: true,
      data: user.annoncesFavorites
    });
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris'
    });
  }
});

module.exports = router;