const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif'],
    default: 0
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'Manuels scolaires',
      'Fournitures',
      'Sacs et cartables',
      'Uniformes',
      'Matériel informatique',
      'Autres'
    ]
  },
  niveau: {
    type: String,
    required: [true, 'Le niveau est requis'],
    enum: ['Primaire', 'Collège', 'Lycée', 'Université']
  },
  type: {
    type: String,
    required: [true, 'Le type est requis'],
    enum: ['Vente', 'Don', 'Échange']
  },
  etat: {
    type: String,
    required: [true, 'L\'état est requis'],
    enum: ['Neuf', 'Comme neuf', 'Bon état', 'État acceptable', 'Usé']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'auteur est requis']
  },
  localisation: {
    ville: {
      type: String,
      required: true
    },
    quartier: String
  },
  disponible: {
    type: Boolean,
    default: true
  },
  vues: {
    type: Number,
    default: 0
  },
  favoris: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDemo: {
    type: Boolean,
    default: false
  },
  statut: {
    type: String,
    enum: ['active', 'vendue', 'echangee', 'expiree', 'suspendue'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware pour incrémenter les vues
annonceSchema.methods.incrementVues = function() {
  this.vues += 1;
  return this.save();
};

// Méthode pour vérifier si l'annonce est favorite d'un utilisateur
annonceSchema.methods.isFavoriteOf = function(userId) {
  return this.favoris.some(fav => fav.toString() === userId.toString());
};

// Index pour optimiser les recherches
annonceSchema.index({ titre: 'text', description: 'text' });
annonceSchema.index({ categorie: 1, niveau: 1 });
annonceSchema.index({ auteur: 1 });
annonceSchema.index({ createdAt: -1 });
annonceSchema.index({ 'localisation.ville': 1 });

// Virtual pour le nombre de favoris
annonceSchema.virtual('nombreFavoris').get(function() {
  return this.favoris ? this.favoris.length : 0;
});

// S'assurer que les virtuals sont inclus lors de la conversion en JSON
annonceSchema.set('toJSON', { virtuals: true });
annonceSchema.set('toObject', { virtuals: true });

const Annonce = mongoose.model('Annonce', annonceSchema);

module.exports = Annonce;