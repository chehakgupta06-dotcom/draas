const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/serverController');

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/servers', ctrl.getAllServers);
router.get('/servers/:id', ctrl.getServerById);
router.post('/servers', ctrl.createServer);
router.put('/servers/:id', ctrl.updateServer);
router.delete('/servers/:id', ctrl.deleteServer);
router.get('/backups', ctrl.getAllBackups);
router.post('/backups/trigger', ctrl.triggerBackup);
router.delete('/backups/:id', ctrl.deleteBackup);
router.post('/recovery/initiate', ctrl.initiateRecovery);
router.get('/policies', ctrl.getAllPolicies);
router.post('/policies', ctrl.createPolicy);
router.put('/policies/:id', ctrl.updatePolicy);
router.delete('/policies/:id', ctrl.deletePolicy);

module.exports = router;