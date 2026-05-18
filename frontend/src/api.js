import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'https://draas-5vlw.onrender.com';
const api = axios.create({ baseURL: BASE });

export const fetchDashboard   = ()         => api.get('/dashboard');
export const fetchServers     = ()         => api.get('/servers');
export const createServer     = (data)     => api.post('/servers', data);
export const updateServer     = (id, data) => api.put(`/servers/${id}`, data);
export const deleteServer     = (id)       => api.delete(`/servers/${id}`);
export const fetchBackups     = ()         => api.get('/backups');
export const triggerBackup    = (data)     => api.post('/backups/trigger', data);
export const deleteBackup     = (id)       => api.delete(`/backups/${id}`);
export const initiateRecovery = (data)     => api.post('/recovery/initiate', data);
export const fetchPolicies    = ()         => api.get('/policies');
export const createPolicy     = (data)     => api.post('/policies', data);
export const updatePolicy     = (id, data) => api.put(`/policies/${id}`, data);
export const deletePolicy     = (id)       => api.delete(`/policies/${id}`);

export default api;