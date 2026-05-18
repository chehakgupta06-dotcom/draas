const Server = require('../models/Server');
const Backup = require('../models/Backup');
const Policy = require('../models/Policy');
const { v4: uuidv4 } = require('uuid');

exports.getAllServers = async (req, res) => {
  try {
    const servers = await Server.find().sort({ createdAt: -1 });
    res.json({ success: true, data: servers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    res.json({ success: true, data: server });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createServer = async (req, res) => {
  try {
    const server = new Server(req.body);
    await server.save();
    res.status(201).json({ success: true, data: server });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    res.json({ success: true, data: server });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    await Backup.deleteMany({ serverId: req.params.id });
    res.json({ success: true, message: 'Server and associated backups deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllBackups = async (req, res) => {
  try {
    const filter = req.query.serverId ? { serverId: req.query.serverId } : {};
    const backups = await Backup.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: backups });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.triggerBackup = async (req, res) => {
  try {
    const { serverId, type = 'full' } = req.body;
    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const backup = new Backup({
      serverId: server._id,
      serverName: server.name,
      type,
      status: 'in-progress',
      location: `S3://draas-backups/${server.name.toLowerCase().replace(/\s/g, '-')}/${uuidv4()}`,
    });
    await backup.save();

    setTimeout(async () => {
      try {
        const size = Math.floor(Math.random() * 4000) + 500;
        const duration = Math.floor(Math.random() * 120) + 30;
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'completed', size, duration,
          checksum: uuidv4().replace(/-/g, ''),
          completedAt: new Date(),
        });
        await Server.findByIdAndUpdate(serverId, { recoveryPoint: new Date() });
      } catch (e) {
        await Backup.findByIdAndUpdate(backup._id, { status: 'failed' });
      }
    }, 3000);

    res.status(201).json({ success: true, data: backup, message: 'Backup initiated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteBackup = async (req, res) => {
  try {
    await Backup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.initiateRecovery = async (req, res) => {
  try {
    const { serverId } = req.body;
    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    await Server.findByIdAndUpdate(serverId, { status: 'recovering' });
    setTimeout(async () => {
      await Server.findByIdAndUpdate(serverId, {
        status: 'online',
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        disk: Math.floor(Math.random() * 30) + 20,
        uptime: 100, lastChecked: new Date(),
      });
    }, 5000);
    res.json({ success: true, message: `Recovery initiated for ${server.name}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.json({ success: true, data: policies });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = new Policy(req.body);
    await policy.save();
    res.status(201).json({ success: true, data: policy });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.json({ success: true, data: policy });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deletePolicy = async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Policy deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalServers, onlineServers, totalBackups, completedBackups, policies] = await Promise.all([
      Server.countDocuments(),
      Server.countDocuments({ status: 'online' }),
      Backup.countDocuments(),
      Backup.countDocuments({ status: 'completed' }),
      Policy.countDocuments({ isActive: true }),
    ]);
    const recentBackups = await Backup.find({ status: 'completed' }).sort({ completedAt: -1 }).limit(5);
    const totalBackupSize = await Backup.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$size' } } },
    ]);
    res.json({
      success: true,
      data: {
        totalServers, onlineServers,
        offlineServers: totalServers - onlineServers,
        totalBackups, completedBackups,
        activePolicies: policies,
        totalBackupSizeMB: totalBackupSize[0]?.total || 0,
        recentBackups,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};