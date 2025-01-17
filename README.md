# API de Jeu Incrémental avec Express et MongoDB

Cette API REST permet de gérer un jeu incrémental basé sur la production d'énergie, avec un système d'authentification, de ressources et d'améliorations (upgrades).

## Prérequis

1. **Node.js** et **npm** installés
2. **MongoDB Community Edition 7.0** installé et fonctionnel
3. **brew** (si utilisateur sous macOS)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/sombreheross/archiOweb-incrementalGame.git
cd archiOweb-incrementalGame
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créer un fichier `.env` à la racine du projet :

```bash
JWT_SECRET=votre_secret_jwt
DATABASE_URL=mongodb://127.0.0.1/votreDB
PORT=3000
```

### 4. Démarrer MongoDB

```bash
brew services start mongodb-community@7.0
```

### 5. Lancer l'application

```bash
npm start
```

## Documentation API

La documentation Swagger est disponible à l'adresse : `http://localhost:3000/api-docs`

## Structure de la base de données

### Collections

#### Users
```javascript
{
  username: String,     // required, unique
  password: String,     // hashed
  admin: Boolean,       // default: false
  position: {
    type: String,      // "Point"
    coordinates: [Number] // [longitude, latitude]
  },
  dynamo: Boolean      // default: false
}
```

#### Resources
```javascript
{
  _id: Number,
  name: String,
  price: Number
}
```

#### Upgrades
```javascript
{
  _id: Number,
  name: String,
  production: Number,
  price: Number,
  unlockLevel: Number  // null si pas de prérequis
}
```

## Tests

Pour lancer les tests :

```bash
npm test
```

## Arrêt des services

Pour arrêter MongoDB :

```bash
brew services stop mongodb-community@7.0
```
