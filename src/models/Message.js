// src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: String,
    required: true,
    index: true
  },
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'expéditeur est requis']
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le destinataire est requis']
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu du message est requis'],
    trim: true,
    maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
  },
  type: {
    type: String,
    enum: ['texte', 'image', 'systeme'],
    default: 'texte'
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  },
  dateLecture: {
    type: Date
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce'
  }
}, {
  timestamps: true
});

// Méthode statique pour créer un ID de conversation unique entre 2 users
messageSchema.statics.createConversationId = function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Méthode pour marquer comme lu
messageSchema.methods.marquerCommeLu = async function() {
  if (!this.lu) {
    this.lu = true;
    this.dateLecture = new Date();
    await this.save();
  }
  return this;
};

// Index pour optimiser les requêtes
messageSchema.index({ conversation: 1, dateEnvoi: -1 });
messageSchema.index({ expediteur: 1, destinataire: 1 });
messageSchema.index({ destinataire: 1, lu: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;