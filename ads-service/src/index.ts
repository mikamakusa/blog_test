import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Ad } from './models/Ad';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ads-service')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/ads', async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

app.get('/api/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

app.post('/api/ads', async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ad' });
  }
});

app.put('/api/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update ad' });
  }
});

app.delete('/api/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

app.listen(port, () => {
  console.log(`Ads service listening at http://localhost:${port}`);
}); 