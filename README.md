# Projet API avec Express et MongoDB

Ce projet met en place une API basée sur **Express** connectée à **MongoDB** via Mongoose, permettant de gérer des utilisateurs, des ressources et leurs relations.

---

## **Prérequis**

1. **Node.js** et **npm** installés.
2. **MongoDB Community Edition 7.0** installé et fonctionnel.
3. **brew** (si utilisateur sous macOS).

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

### Étape 3 : Lancer l'application

Démarre l'application avec Node.js :

```bash
npm run dev
```

---

## **API**

### Endpoints disponibles

#### 1. Index (`/`)

- **GET** `/` : Point d'entrée principal de l'API.

#### 2. Utilisateurs (`/users`)

- **GET** `/users` : Récupère tous les utilisateurs.
- **POST** `/users` : Crée un nouvel utilisateur.

#### 3. Ressources (`/resources`)

- **GET** `/resources` : Récupère toutes les ressources.
- **POST** `/resources` : Crée une nouvelle ressource.

---

## **Connexion MongoDB**

L'application se connecte à MongoDB via Mongoose avec l'URL suivante, définie dans le fichier `app.js` :

```javascript
mongoose.connect('mongodb://127.0.0.1/testDB');
```

### Vérification de la connexion

- Si la connexion réussit, tu verras un message dans la console lors du démarrage de l'application indiquant que le serveur écoute.
- En cas d'échec, assure-toi que :
  - MongoDB est bien démarré (`brew services start mongodb-community@7.0`).
  - L'adresse et le port dans `mongoose.connect` sont corrects (`127.0.0.1` est l'adresse par défaut pour localhost).

---

## **Insertion des données**

### Exemple d'insertion dans MongoDB

#### 1. Créer des utilisateurs

```javascript
db.User.insertMany([
  { _id: 1, username: "john_doe", password: "password123" },
  { _id: 2, username: "jane_smith", password: "securePass!" }
])
```

#### 2. Créer des ressources

```javascript
db.Resource.insertMany([
  { _id: 1, name: "Gold", price: 1.0 },
  { _id: 2, name: "Energy", price: 1.0 }
])
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

---

## **Contributeurs**

- **Nom** : [Ton GitHub](https://github.com/ton-profil)
- **Contact** : [email@example.com](mailto\:email@example.com)

---

Avec ce fichier, les développeurs peuvent facilement démarrer et tester ton application. 😊

