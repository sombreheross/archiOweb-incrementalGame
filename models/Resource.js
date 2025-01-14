import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Définir le schéma pour Resource
const resourceSchema = new Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
}, {
  _id: false // Désactive la génération automatique de l'ObjectId
});

// Créer le modèle à partir du schéma et l'exporter
export default mongoose.model('Resource', resourceSchema);
