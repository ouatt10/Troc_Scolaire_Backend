// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB connecté avec succès');
    console.log(`📊 Base de données: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose déconnecté');
});

// Fermeture propre lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Connexion MongoDB fermée (arrêt application)');
  process.exit(0);
});

module.exports = connectDB;