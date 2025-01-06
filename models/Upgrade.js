import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const upgradeSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  production: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  unlockLevel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Upgrade',
    default: null
  }
});

export default mongoose.model('Upgrade', upgradeSchema); 