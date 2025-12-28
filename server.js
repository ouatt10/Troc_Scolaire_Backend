// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO pour le chat en temps réel
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connexion à MongoDB réussie'))
  .catch((err) => console.error('❌ Erreur connexion MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🎓 API TrocScolaire - Bienvenue !',
    version: '1.0.0',
    status: 'active'
  });
});

// Import des routes (à créer)
const authRoutes = require('./src/routes/auth');
const annonceRoutes = require('./src/routes/annonces');
const messageRoutes = require('./src/routes/messages');
const userRoutes = require('./src/routes/users');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Gestion Socket.IO pour le chat temps réel
const socketHandler = require('./src/socket/socketHandler');
socketHandler(io);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée' 
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});