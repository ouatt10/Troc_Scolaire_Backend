const Message = require('../models/Message');
const User = require('../models/User');

// Map pour stocker les utilisateurs connectés
const connectedUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Nouveau client connecté:', socket.id);

    // Connexion d'un utilisateur
    socket.on('user:connect', async (userId) => {
      try {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        
        console.log(`👤 Utilisateur ${userId} connecté avec socket ${socket.id}`);
        
        // Notifier que l'utilisateur est en ligne
        socket.broadcast.emit('user:online', userId);
        
        // Rejoindre sa propre room
        socket.join(userId);
      } catch (error) {
        console.error('Erreur connexion utilisateur:', error);
      }
    });

    // Envoi d'un message
    socket.on('message:send', async (data) => {
      try {
        const { expediteur, destinataire, contenu, annonceId } = data;

        // Créer l'ID de conversation
        const conversationId = Message.createConversationId(expediteur, destinataire);

        // Créer le message dans la base de données
        const nouveauMessage = await Message.create({
          conversation: conversationId,
          expediteur,
          destinataire,
          contenu,
          annonce: annonceId || null,
          type: 'texte',
          dateEnvoi: new Date()
        });

        // Peupler les infos de l'expéditeur
        await nouveauMessage.populate('expediteur', 'nom prenom avatar');
        await nouveauMessage.populate('destinataire', 'nom prenom avatar');

        // Envoyer le message à l'expéditeur (confirmation)
        socket.emit('message:received', nouveauMessage);

        // Envoyer le message au destinataire s'il est connecté
        const destinataireSocketId = connectedUsers.get(destinataire);
        if (destinataireSocketId) {
          io.to(destinataireSocketId).emit('message:new', nouveauMessage);
        }

        console.log(`📨 Message envoyé de ${expediteur} à ${destinataire}`);
      } catch (error) {
        console.error('Erreur envoi message:', error);
        socket.emit('message:error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Marquer des messages comme lus
    socket.on('messages:mark-read', async (data) => {
      try {
        const { conversationId, userId } = data;

        // Marquer tous les messages non lus de cette conversation comme lus
        await Message.updateMany(
          {
            conversation: conversationId,
            destinataire: userId,
            lu: false
          },
          {
            $set: { 
              lu: true, 
              dateLecture: new Date() 
            }
          }
        );

        // Notifier l'autre utilisateur
        const expediteurId = conversationId.split('_').find(id => id !== userId);
        const expediteurSocketId = connectedUsers.get(expediteurId);
        
        if (expediteurSocketId) {
          io.to(expediteurSocketId).emit('messages:read', {
            conversationId,
            readBy: userId
          });
        }

        console.log(`✅ Messages lus dans conversation ${conversationId}`);
      } catch (error) {
        console.error('Erreur marquage messages lus:', error);
      }
    });

    // Utilisateur en train d'écrire
    socket.on('typing:start', (data) => {
      const { destinataire, expediteur } = data;
      const destinataireSocketId = connectedUsers.get(destinataire);
      
      if (destinataireSocketId) {
        io.to(destinataireSocketId).emit('typing:user', {
          userId: expediteur,
          typing: true
        });
      }
    });

    // Utilisateur a arrêté d'écrire
    socket.on('typing:stop', (data) => {
      const { destinataire, expediteur } = data;
      const destinataireSocketId = connectedUsers.get(destinataire);
      
      if (destinataireSocketId) {
        io.to(destinataireSocketId).emit('typing:user', {
          userId: expediteur,
          typing: false
        });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        socket.broadcast.emit('user:offline', socket.userId);
        console.log(`👋 Utilisateur ${socket.userId} déconnecté`);
      }
      console.log('❌ Client déconnecté:', socket.id);
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
      console.error('❌ Erreur Socket:', error);
    });
  });

  // Fonction pour obtenir les utilisateurs connectés
  io.getConnectedUsers = () => {
    return Array.from(connectedUsers.keys());
  };
};

module.exports = socketHandler;