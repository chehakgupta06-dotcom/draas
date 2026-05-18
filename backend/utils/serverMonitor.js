const cron = require('node-cron');
const Server = require('../models/Server');

function startMonitoring() {
  console.log('Server monitoring started');
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const servers = await Server.find({ status: { $ne: 'offline' } });
      for (const server of servers) {
        const newCpu = Math.min(100, Math.max(0, server.cpu + (Math.random() - 0.5) * 10));
        const newMem = Math.min(100, Math.max(0, server.memory + (Math.random() - 0.5) * 8));
        const newDisk = Math.min(100, Math.max(0, server.disk + Math.random() * 0.2));
        let newStatus = newCpu > 90 || newMem > 90 ? 'degraded' : 'online';
        if (server.status === 'recovering') newStatus = 'recovering';
        await Server.findByIdAndUpdate(server._id, {
          cpu: Math.round(newCpu * 10) / 10,
          memory: Math.round(newMem * 10) / 10,
          disk: Math.round(newDisk * 10) / 10,
          status: newStatus,
          lastChecked: new Date(),
        });
      }
    } catch (err) { console.error('Monitoring error:', err.message); }
  });
}

module.exports = { startMonitoring };