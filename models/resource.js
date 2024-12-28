import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Définir le schéma pour Resource
const resourceSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// Créer le modèle à partir du schéma et l'exporter
export default mongoose.model('Resource', resourceSchema);