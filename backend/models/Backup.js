const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema(
  {
    serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
    serverName: { type: String, required: true },
    type: { type: String, enum: ['full', 'incremental', 'differential'], default: 'full' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' },
    size: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    location: { type: String, default: 'S3://draas-backups' },
    checksum: { type: String, default: '' },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Backup', backupSchema);