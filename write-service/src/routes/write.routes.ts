import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes except health check
router.use(authMiddleware);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  description: z.string().max(500).optional(),
  slug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  author: z.number(),
});

// Create post endpoint
router.post('/posts', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Received POST request to /posts');
  logger.info('Request body:', req.body);
  logger.info('Request headers:', req.headers);
  
  try {
    const validatedData = postSchema.parse(req.body);
    logger.info('Validated post data:', validatedData);

    // Log environment variables
    logger.info('Environment variables:', {
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_STRAPI_API_TOKEN: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? 'Token exists' : 'Token missing'
    });

    // Forward the request to Strapi
    const strapiUrl = `${process.env.BACKEND_URL}/api/blogs`;
    logger.info('Sending request to Strapi:', strapiUrl);

    const response = await axios.post(
      strapiUrl,
      {
        data: {
          ...validatedData,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Strapi response:', response.data);
    res.status(201).json(response.data);
  } catch (error) {
    logger.error('Error creating post:', error);
    if (error instanceof z.ZodError) {
      logger.error('Validation error:', error.errors);
      next(new AppError(400, 'Invalid input data'));
    } else if (axios.isAxiosError(error)) {
      logger.error('Strapi API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      next(new AppError(error.response?.status || 500, 'Error creating post'));
    } else {
      next(new AppError(500, 'Error creating post'));
    }
  }
});

// Update post endpoint
router.put('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = postSchema.parse(req.body);
    const response = await axios.put(
      `${process.env.BACKEND_URL}/api/blogs/${req.params.id}`,
      {
        data: validatedData,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid input data'));
    } else {
      logger.error('Error updating post:', error);
      next(new AppError(500, 'Error updating post'));
    }
  }
});

// Delete post endpoint
router.delete('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/blogs/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      }
    );

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting post:', error);
    next(new AppError(500, 'Error deleting post'));
  }
});

export const writeRouter = router; 