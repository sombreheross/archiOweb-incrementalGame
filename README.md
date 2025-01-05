# Projet API avec Express et MongoDB

Ce projet met en place une API basée sur **Express** connectée à **MongoDB** via Mongoose, permettant de gérer des utilisateurs, des ressources et leurs relations.

---

## **Prérequis**

1. **Node.js** et **npm** installés
2. **MongoDB Community Edition 7.0** installé et fonctionnel
3. **brew** (si utilisateur sous macOS)

---

## **Commandes de démarrage**

### **Terminal 1 : Lancer MongoDB**

Pour démarrer MongoDB via `brew` :

```bash
brew services start mongodb-community@7.0
```

Pour arrêter MongoDB :

```bash
brew services stop mongodb-community@7.0
```

---

### **Terminal 2 : Interagir avec MongoDB**

#### Lancer le client `mongosh` :

```bash
mongosh
```

#### Créer ou accéder à la base de données :

```bash
use testDB
```

MongoDB crée automatiquement la base de données `testDB` si elle n'existe pas encore.

---

## **Configuration de l'application**

### Étape 1 : Cloner le projet

Clone le projet et accède au répertoire :

```bash
git clone https://github.com/ton-repo.git
cd ton-repo
```

### Étape 2 : Installer les dépendances

Installe les modules nécessaires via npm :

```bash
npm install
```

### Étape 3 : Configuration des variables d'environnement

Crée un fichier `.env` avec :

```bash
JWT_SECRET=votre_secret_jwt
DATABASE_URL=mongodb://127.0.0.1/testDB
PORT=3000
```

### Étape 4 : Lancer l'application

Démarre l'application avec Node.js :

```bash
npm start
```

---

## **API Endpoints**

### Authentication
- **POST** `/users/register` : Créer un nouveau compte
  - Body: `{ "username": "string", "password": "string" }`

- **POST** `/users/login` : Se connecter
  - Body: `{ "username": "string", "password": "string" }`
  - Returns: `{ "token": "jwt_token" }`

### Resources
- **GET** `/resources` : Liste toutes les ressources
- **POST** `/resources` : Crée une nouvelle ressource
  - Body: `{ "name": "string", "price": number }`
- **GET** `/resources/:id` : Obtient une ressource spécifique
- **PATCH** `/resources/:id` : Met à jour le prix d'une ressource
  - Body: `{ "price": number }`
- **DELETE** `/resources/:id` : Supprime une ressource

### User Resources (Routes Protégées)
Nécessite le header Authorization: `Bearer <token>`

- **GET** `/resources/:id/resource` : Obtient la quantité d'une ressource pour l'utilisateur authentifié
- **POST** `/resources/:id/resource` : Crée un lien entre l'utilisateur et une ressource
  - Body: `{ "amount": number }`
- **PATCH** `/resources/:id/resource` : Met à jour la quantité d'une ressource pour l'utilisateur
  - Body: `{ "amount": number }`

---

## **Structure de la Base de Données**

### Collections

#### Users
```javascript
{
  username: String,  // required, unique
  password: String   // hashed
}
```

#### Resources
```javascript
{
  name: String,    // required
  price: Number    // required
}
```

#### UserResources
```javascript
{
  user_id: ObjectId,     // ref: 'User'
  resource_id: ObjectId, // ref: 'Resource'
  amount: Number         // default: 0
}
```

---

## **Vérification des données**

### 1. Voir toutes les données d'une collection

```javascript
db.NomDeLaCollection.find().pretty()
```

Exemples :
- Utilisateurs : `db.User.find().pretty()`
- Ressources : `db.Resource.find().pretty()`
- Liens User-Resource : `db.UserResource.find().pretty()`

### 2. Compter les documents

```javascript
db.NomDeLaCollection.countDocuments()
```

---

## **Arrêt de MongoDB**

Pour arrêter MongoDB, utilise cette commande :

```bash
brew services stop mongodb-community@7.0
```