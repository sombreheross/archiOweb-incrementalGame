import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userUpgradeSchema = new Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  upgrade_id: { 
    type: Number,
    ref: 'Upgrade',
    required: true 
  }
});

// Create a compound index to ensure unique combinations
userUpgradeSchema.index({ user_id: 1, upgrade_id: 1 }, { unique: true });

export default mongoose.model('UserUpgrade', userUpgradeSchema); 