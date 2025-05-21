import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = express.Router();
const STRAPI_URL = process.env.BACKEND_URL || 'http://localhost:1337';

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all ads
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/ads`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });
    res.json(response.data.data);
  } catch (error) {
    logger.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Get single ad
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/ads/${req.params.id}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });
    res.json(response.data.data);
  } catch (error) {
    logger.error('Error fetching ad:', error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

// Create ad
router.post('/', async (req, res) => {
  try {
    logger.info('Received ad creation request');
    logger.info('Request headers:', req.headers);
    logger.info('Raw request body:', req.body);
    logger.info('Content-Type:', req.headers['content-type']);

    // Ensure all required fields are present
    const requiredFields = ['title', 'description', 'image_url', 'target_url', 'start_date', 'end_date', 'position', 'priority'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.error('Missing required fields:', missingFields);
      logger.error('Available fields:', Object.keys(req.body));
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const adData = {
      data: {
        title: req.body.title,
        description: req.body.description,
        image_url: req.body.image_url,
        target_url: req.body.target_url,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        position: req.body.position,
        priority: parseInt(req.body.priority, 10),
        is_active: req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 'on'
      }
    };

    logger.info('Formatted ad data for Strapi:', adData);

    const response = await axios.post(
      `${STRAPI_URL}/api/ads`,
      adData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info('Strapi response:', response.data);
    res.status(201).json(response.data.data);
  } catch (error) {
    logger.error('Error creating ad:', error);
    if (axios.isAxiosError(error)) {
      logger.error('Strapi error response:', error.response?.data);
      logger.error('Request data:', error.config?.data);
    }
    res.status(400).json({ error: 'Failed to create ad' });
  }
});

// Update ad
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(
      `${STRAPI_URL}/api/ads/${req.params.id}`,
      {
        data: {
          title: req.body.title,
          description: req.body.description,
          image_url: req.body.image_url,
          target_url: req.body.target_url,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          position: req.body.position,
          priority: req.body.priority,
          is_active: req.body.is_active
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
        }
      }
    );
    res.json(response.data.data);
  } catch (error) {
    logger.error('Error updating ad:', error);
    if (axios.isAxiosError(error)) {
      logger.error('Strapi error response:', error.response?.data);
    }
    res.status(400).json({ error: 'Failed to update ad' });
  }
});

// Delete ad
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${STRAPI_URL}/api/ads/${req.params.id}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting ad:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

export default router; 