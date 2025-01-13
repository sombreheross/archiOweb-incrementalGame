import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const upgradeSchema = new Schema({
  _id: { 
    type: Number,
    required: true
  },
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
    type: Number,
    default: null
  }
});

export default mongoose.model('Upgrade', upgradeSchema); 