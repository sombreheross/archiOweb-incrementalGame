import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userResourceSchema = new Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  resource_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resource',
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    default: 0,
    min: [0, 'Le montant ne peut pas être négatif']
  }
});

// Create a compound index to ensure unique combinations
userResourceSchema.index({ user_id: 1, resource_id: 1 }, { unique: true });

export default mongoose.model('UserResource', userResourceSchema);
