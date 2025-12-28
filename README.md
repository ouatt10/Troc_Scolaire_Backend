# 🎓 TrocScolaire - Backend API

API REST pour la plateforme d'échange de fournitures scolaires TrocScolaire, construite avec Node.js, Express et MongoDB.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Modèles de données](#-modèles-de-données)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

## ✨ Fonctionnalités

- **Authentification & Autorisation**
  - Inscription et connexion utilisateur
  - Tokens JWT pour sécuriser les routes
  - Middleware de protection des routes
  
- **Gestion des Annonces**
  - CRUD complet (Créer, Lire, Modifier, Supprimer)
  - Filtrage par catégorie, niveau, type, ville, prix
  - Recherche textuelle
  - Pagination
  - Système de favoris
  - Compteur de vues

- **Messagerie en temps réel**
  - Chat entre utilisateurs via Socket.IO
  - Conversations privées
  - Suivi des messages lus/non lus
  - Historique des conversations

- **Profils utilisateurs**
  - Informations personnelles
  - Localisation (ville, quartier)
  - Avatar par défaut
  - Historique des échanges

## 🛠️ Technologies utilisées

- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JSON Web Tokens (JWT), bcrypt
- **Temps réel** : Socket.IO
- **Upload d'images** : Multer, Cloudinary
- **Validation** : express-validator
- **Variables d'environnement** : dotenv
- **Dev Tools** : nodemon
- **CORS** : cors

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (v14 ou supérieur)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) ou compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Git](https://git-scm.com/)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/ouatt10/Troc_Scolaire_Backend.git
cd Troc_Scolaire_Backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration MongoDB

**Option A : MongoDB Local**
```bash
# Assurez-vous que MongoDB est démarré
mongod
```

**Option B : MongoDB Atlas**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Autorisez votre IP
5. Obtenez votre chaîne de connexion

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Configuration serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB
# Pour MongoDB Local :
MONGODB_URI=mongodb://localhost:27017/trocscolaire

# Pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/trocscolaire?retryWrites=true&w=majority

# JWT Secret (changez en production !)
JWT_SECRET=votre_secret_key_tres_securise_changez_moi

# Cloudinary (optionnel - pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env` ! Il est déjà dans le `.gitignore`.

## 🎬 Démarrage

### Mode développement (avec auto-reload)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

Vous devriez voir :
```
🚀 Serveur démarré sur le port 5000
📡 Environnement: development
🌐 URL: http://localhost:5000
✅ Connexion à MongoDB réussie
```

## 📁 Structure du projet

```
Troc_Scolaire_Backend/
├── src/
│   ├── config/
│   │   ├── cloudinary.js      # Configuration Cloudinary
│   │   └── database.js         # Connexion MongoDB
│   ├── middleware/
│   │   ├── auth.js             # Middleware JWT
│   │   └── upload.js           # Middleware upload images
│   ├── models/
│   │   ├── User.js             # Modèle Utilisateur
│   │   ├── Annonce.js          # Modèle Annonce
│   │   └── Message.js          # Modèle Message
│   ├── routes/
│   │   ├── auth.js             # Routes authentification
│   │   ├── annonces.js         # Routes annonces
│   │   ├── messages.js         # Routes messages
│   │   └── users.js            # Routes utilisateurs
│   └── socket/
│       └── socketHandler.js    # Gestion Socket.IO
├── .env                        # Variables d'environnement (non versionné)
├── .gitignore                  # Fichiers ignorés par Git
├── package.json                # Dépendances et scripts
├── server.js                   # Point d'entrée de l'application
└── README.md                   # Documentation
```

## 🔌 API Endpoints

### Authentification

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/auth/register` | Inscription utilisateur | Non |
| POST | `/api/auth/login` | Connexion utilisateur | Non |
| GET | `/api/auth/me` | Obtenir profil connecté | Oui |
| PUT | `/api/auth/updateProfile` | Modifier profil | Oui |

### Annonces

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/api/annonces` | Liste des annonces (avec filtres) | Non |
| GET | `/api/annonces/:id` | Détails d'une annonce | Non |
| POST | `/api/annonces` | Créer une annonce | Oui |
| PUT | `/api/annonces/:id` | Modifier une annonce | Oui |
| DELETE | `/api/annonces/:id` | Supprimer une annonce | Oui |
| GET | `/api/annonces/user/:userId` | Annonces d'un utilisateur | Non |
| POST | `/api/annonces/:id/favoris` | Ajouter/Retirer des favoris | Oui |

### Messages

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/api/messages/conversations` | Liste des conversations | Oui |
| GET | `/api/messages/:conversationId` | Messages d'une conversation | Oui |
| POST | `/api/messages` | Envoyer un message | Oui |
| PUT | `/api/messages/:conversationId/mark-read` | Marquer comme lu | Oui |
| GET | `/api/messages/unread/count` | Nombre de messages non lus | Oui |

### Utilisateurs

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/api/users/:id` | Profil public d'un utilisateur | Non |
| GET | `/api/users/me/favoris` | Annonces favorites | Oui |

### Exemples de requêtes

#### Inscription

```bash
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Diallo",
  "prenom": "Fatima",
  "email": "fatima.diallo@test.com",
  "password": "password123",
  "telephone": "0709080706",
  "ville": "Abidjan",
  "quartier": "Plateau"
}
```

#### Créer une annonce

```bash
POST /api/annonces
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json

{
  "titre": "Manuel de Mathématiques Terminale S",
  "description": "Collection complète en excellent état",
  "prix": 5000,
  "categorie": "Manuels scolaires",
  "niveau": "Lycée",
  "type": "Vente",
  "etat": "Bon état",
  "images": []
}
```

#### Rechercher des annonces

```bash
GET /api/annonces?categorie=Manuels%20scolaires&niveau=Lycée&minPrix=1000&maxPrix=10000&page=1&limit=12
```

## 📊 Modèles de données

### User (Utilisateur)

```javascript
{
  nom: String,
  prenom: String,
  email: String (unique),
  password: String (hashé),
  telephone: String,
  ville: String,
  quartier: String,
  avatar: String,
  role: String (default: 'user'),
  note: Number,
  nombreEchanges: Number,
  annoncesFavorites: [ObjectId]
}
```

### Annonce

```javascript
{
  titre: String,
  description: String,
  prix: Number,
  categorie: String,
  niveau: String,
  type: String,
  etat: String,
  images: [{ url: String, publicId: String }],
  auteur: ObjectId (ref: User),
  localisation: {
    ville: String,
    quartier: String
  },
  statut: String (default: 'active'),
  vues: Number,
  favoris: [ObjectId]
}
```

### Message

```javascript
{
  conversation: String,
  expediteur: ObjectId (ref: User),
  destinataire: ObjectId (ref: User),
  contenu: String,
  lu: Boolean,
  dateEnvoi: Date,
  dateLecture: Date,
  annonce: ObjectId (ref: Annonce)
}
```

## 🧪 Tests

Pour tester l'API, vous pouvez utiliser :

### Postman

1. Importez la collection Postman (si disponible)
2. Configurez l'environnement avec `base_url = http://localhost:5000`
3. Testez les différents endpoints

### MongoDB Compass

1. Connectez-vous à `mongodb://localhost:27017`
2. Consultez la base de données `trocscolaire`
3. Vérifiez les collections : `users`, `annonces`, `messages`

## 🌐 Déploiement

### Déploiement sur Render

1. Créez un compte sur [Render](https://render.com)
2. Créez un nouveau Web Service
3. Connectez votre repository GitHub
4. Configurez les variables d'environnement
5. Déployez !

### Variables d'environnement en production

```env
NODE_ENV=production
MONGODB_URI=<votre_mongodb_atlas_uri>
JWT_SECRET=<secret_securise_production>
FRONTEND_URL=<url_frontend_deploye>
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add: Amazing feature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

**OUATTARA El Hadj Fetigue**
- GitHub: [@ouatt10](https://github.com/ouatt10)
- Projet Frontend: [Troc_Scolaire](https://github.com/ouatt10/Troc_Scolaire)

## 🙏 Remerciements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)
- [JWT](https://jwt.io/)

---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile sur GitHub !