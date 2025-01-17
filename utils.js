import mongoose from "mongoose";
import User from "./models/User.js";
import Resource from "./models/Resource.js";
import Upgrade from "./models/Upgrade.js";
import supertest from "supertest";
import app from "./app.js";

export const cleanUpDatabase = async function() {
  await mongoose.connection.dropDatabase();
  console.log("Database cleaned");
  // Initialize admin user
  await User.create({
    username: "adminLEL", 
    password: "passwordLEL",
    admin: true
  });
  console.log("Admin user initialized");

  // Initialize resources
  await Resource.insertMany([
    { "_id": 1, "name": "Gold", "price": 1.0 },
    { "_id": 2, "name": "Energy", "price": 1.0 }
  ]);
  console.log("Resources initialized");

  // Initialize upgrades
  await Upgrade.insertMany([
    { "_id": 1, "name": "Petite batterie", "production": 1.0, "price": 5, "unlockLevel": null },
    { "_id": 2, "name": "Éolienne Moyenne 1", "production": 1.5, "price": 10, "unlockLevel": 1 },
    { "_id": 3, "name": "Éolienne Moyenne 2", "production": 1.5, "price": 30, "unlockLevel": 2 },
    { "_id": 4, "name": "Éolienne Moyenne 3", "production": 1.5, "price": 35, "unlockLevel": 3 },
    { "_id": 5, "name": "Éolienne Moyenne 4", "production": 1.5, "price": 40, "unlockLevel": 4 },
    { "_id": 6, "name": "Grande Éolienne 1", "production": 1.75, "price": 60, "unlockLevel": 2 },
    { "_id": 7, "name": "Grande Éolienne 2", "production": 1.75, "price": 80, "unlockLevel": 6 },
    { "_id": 8, "name": "Grande Éolienne 3", "production": 1.75, "price": 100, "unlockLevel": 7 },
    { "_id": 9, "name": "Grande Éolienne 4", "production": 1.75, "price": 150, "unlockLevel": 8 },
    { "_id": 10, "name": "Grande Éolienne 5", "production": 1.75, "price": 200, "unlockLevel": 9 },
    { "_id": 11, "name": "Outils de construction", "production": 1.0, "price": 500, "unlockLevel": 6 },
    { "_id": 12, "name": "Petit panneau solaire", "production": 2.0, "price": 1000, "unlockLevel": 11 },
    { "_id": 13, "name": "Panneau solaire moyen 1", "production": 2.0, "price": 1500, "unlockLevel": 12 },
    { "_id": 14, "name": "Panneau solaire moyen 2", "production": 2.0, "price": 3000, "unlockLevel": 13 },
    { "_id": 15, "name": "Panneau solaire moyen 3", "production": 2.0, "price": 4500, "unlockLevel": 14 },
    { "_id": 16, "name": "Panneau solaire moyen 4", "production": 2.0, "price": 5000, "unlockLevel": 15 },
    { "_id": 17, "name": "Grand panneau solaire 1", "production": 2.25, "price": 50000, "unlockLevel": 13 },
    { "_id": 18, "name": "Grand panneau solaire 2", "production": 2.25, "price": 100000, "unlockLevel": 17 },
    { "_id": 19, "name": "Grand panneau solaire 3", "production": 2.25, "price": 200000, "unlockLevel": 18 },
    { "_id": 20, "name": "Grand panneau solaire 4", "production": 2.25, "price": 300000, "unlockLevel": 19 },
    { "_id": 21, "name": "Grand panneau solaire 5", "production": 2.25, "price": 500000, "unlockLevel": 20 },
    { "_id": 22, "name": "Terrain avec accès à la rivière", "production": 1.0, "price": 5000000, "unlockLevel": null },
    { "_id": 23, "name": "Barrage", "production": 1.0, "price": 1000000, "unlockLevel": 22 },
    { "_id": 24, "name": "Turbine 1", "production": 1.5, "price": 1500000, "unlockLevel": 23 },
    { "_id": 25, "name": "Turbine 2", "production": 1.5, "price": 2000000, "unlockLevel": 24 },
    { "_id": 26, "name": "Turbine 3", "production": 1.5, "price": 3000000, "unlockLevel": 25 },
    { "_id": 27, "name": "Turbine 4", "production": 1.5, "price": 4000000, "unlockLevel": 26 },
    { "_id": 28, "name": "Éoliennes sur le barrage 1", "production": 1.7, "price": 4500000, "unlockLevel": 23 },
    { "_id": 29, "name": "Éoliennes sur le barrage 2", "production": 1.7, "price": 5800000, "unlockLevel": 28 },
    { "_id": 30, "name": "Éoliennes sur le barrage 3", "production": 1.7, "price": 9000000, "unlockLevel": 29 },
    { "_id": 31, "name": "Terrain pour parc éolien", "production": 1.0, "price": 10000000, "unlockLevel": 22 },
    { "_id": 32, "name": "Parc éolien", "production": 1.75, "price": 60000000, "unlockLevel": 31 },
    { "_id": 33, "name": "Terrain pour champ solaire", "production": 1.0, "price": 80000000, "unlockLevel": 22 },
    { "_id": 34, "name": "Champ solaire", "production": 1.8, "price": 100000000, "unlockLevel": 33 },
    { "_id": 35, "name": "Terrain en lisière de la ville", "production": 1.0, "price": 120000000, "unlockLevel": 22 },
    { "_id": 36, "name": "Station de production de biomasse 1", "production": 1.85, "price": 300000000, "unlockLevel": 35 },
    { "_id": 37, "name": "Station de production de biomasse 2", "production": 1.85, "price": 380000000, "unlockLevel": 36 },
    { "_id": 38, "name": "Station de production de biomasse 3", "production": 1.85, "price": 500000000, "unlockLevel": 37 },
    { "_id": 39, "name": "Achat de la ville", "production": 1.0, "price": 1000000000, "unlockLevel": 38 }
]);
  console.log("Upgrades initialized");
};