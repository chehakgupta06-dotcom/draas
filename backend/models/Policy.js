const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rto: { type: Number, required: true },
    rpo: { type: Number, required: true },
    backupFrequency: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], default: 'daily' },
    retentionDays: { type: Number, default: 30 },
    backupType: { type: String, enum: ['full', 'incremental', 'differential'], default: 'incremental' },
    replicationEnabled: { type: Boolean, default: true },
    replicationRegions: [String],
    encryptionEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    assignedServers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Server' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);