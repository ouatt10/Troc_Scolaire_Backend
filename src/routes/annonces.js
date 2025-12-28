// src/routes/annonces.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Annonce = require('../models/Annonce');
const { protect } = require('../middleware/auth');

// Validation pour création d'annonce
const annonceValidation = [
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('prix').isNumeric().withMessage('Le prix doit être un nombre'),
  body('categorie').notEmpty().withMessage('La catégorie est requise'),
  body('niveau').notEmpty().withMessage('Le niveau est requis'),
  body('type').notEmpty().withMessage('Le type est requis'),
  body('etat').notEmpty().withMessage('L\'état est requis')
];

// @route   GET /api/annonces
// @desc    Obtenir toutes les annonces (avec filtres)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      categorie, 
      niveau, 
      type, 
      ville, 
      search, 
      minPrix, 
      maxPrix,
      page = 1,
      limit = 12
    } = req.query;

    // Construire le filtre
    let filter = { statut: 'active' };

    if (categorie) filter.categorie = categorie;
    if (niveau) filter.niveau = niveau;
    if (type) filter.type = type;
    if (ville) filter['localisation.ville'] = ville;
    
    if (minPrix || maxPrix) {
      filter.prix = {};
      if (minPrix) filter.prix.$gte = Number(minPrix);
      if (maxPrix) filter.prix.$lte = Number(maxPrix);
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Récupérer les annonces
    const annonces = await Annonce.find(filter)
      .populate('auteur', 'nom prenom ville avatar note')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Compter le total
    const total = await Annonce.countDocuments(filter);

    res.json({
      success: true,
      data: annonces,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération annonces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces'
    });
  }
});

// @route   GET /api/annonces/:id
// @desc    Obtenir une annonce par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id)
      .populate('auteur', 'nom prenom ville quartier avatar note nombreEchanges telephone');

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    // Incrémenter les vues
    await annonce.incrementVues();

    res.json({
      success: true,
      data: annonce
    });
  } catch (error) {
    console.error('Erreur récupération annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'annonce'
    });
  }
});

// @route   POST /api/annonces
// @desc    Créer une nouvelle annonce
// @access  Private
router.post('/', protect, annonceValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      titre,
      description,
      prix,
      categorie,
      niveau,
      type,
      etat,
      images
    } = req.body;

    // Créer l'annonce
    const annonce = await Annonce.create({
      titre,
      description,
      prix,
      categorie,
      niveau,
      type,
      etat,
      images: images || [],
      auteur: req.user._id,
      localisation: {
        ville: req.user.ville,
        quartier: req.user.quartier
      }
    });

    // Peupler l'auteur
    await annonce.populate('auteur', 'nom prenom ville avatar');

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: annonce
    });
  } catch (error) {
    console.error('Erreur création annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'annonce'
    });
  }
});

// @route   PUT /api/annonces/:id
// @desc    Modifier une annonce
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let annonce = await Annonce.findById(req.params.id);

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (annonce.auteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette annonce'
      });
    }

    // Mettre à jour l'annonce
    annonce = await Annonce.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('auteur', 'nom prenom ville avatar');

    res.json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      data: annonce
    });
  } catch (error) {
    console.error('Erreur mise à jour annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'annonce'
    });
  }
});

// @route   DELETE /api/annonces/:id
// @desc    Supprimer une annonce
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (annonce.auteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette annonce'
      });
    }

    await annonce.deleteOne();

    res.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'annonce'
    });
  }
});

// @route   GET /api/annonces/user/:userId
// @desc    Obtenir les annonces d'un utilisateur
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const annonces = await Annonce.find({ 
      auteur: req.params.userId,
      statut: 'active'
    })
      .populate('auteur', 'nom prenom ville avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: annonces
    });
  } catch (error) {
    console.error('Erreur récupération annonces utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces'
    });
  }
});

// @route   POST /api/annonces/:id/favoris
// @desc    Ajouter/Retirer une annonce des favoris
// @access  Private
router.post('/:id/favoris', protect, async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    const isFavorite = annonce.favoris.includes(req.user._id);

    if (isFavorite) {
      // Retirer des favoris
      annonce.favoris = annonce.favoris.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Ajouter aux favoris
      annonce.favoris.push(req.user._id);
    }

    await annonce.save();

    res.json({
      success: true,
      message: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
      isFavorite: !isFavorite
    });
  } catch (error) {
    console.error('Erreur favoris:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la gestion des favoris'
    });
  }
});

module.exports = router;