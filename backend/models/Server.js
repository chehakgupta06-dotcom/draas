const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ipAddress: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['online', 'offline', 'degraded', 'recovering'], default: 'online' },
    type: { type: String, enum: ['primary', 'secondary', 'backup'], default: 'primary' },
    cpu: { type: Number, default: 0, min: 0, max: 100 },
    memory: { type: Number, default: 0, min: 0, max: 100 },
    disk: { type: Number, default: 0, min: 0, max: 100 },
    uptime: { type: Number, default: 100 },
    lastChecked: { type: Date, default: Date.now },
    recoveryPoint: { type: Date, default: null },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Server', serverSchema);