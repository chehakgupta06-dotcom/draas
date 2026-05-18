const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const serverRoutes = require('./routes/serverRoutes');
const { startMonitoring } = require('./utils/serverMonitor');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/draas';

app.use(cors({
  origin: ['http://localhost:3000', 'https://draas.netlify.app/'],
  credentials: true
}));
app.use(express.json());
app.use('/api', serverRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'DRaaS API is running', status: 'ok' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startMonitoring();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });