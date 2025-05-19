import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.error('No token provided in request');
      return res.status(401).json({ message: 'No token provided' });
    }

    logger.info('Verifying token with auth service...');
    logger.info('Auth service URL:', `${process.env.AUTH_SERVICE_URL}/auth/validate`);
    logger.info('Request headers:', {
      authorization: req.headers.authorization,
      'content-type': req.headers['content-type'],
    });

    // Verify token with auth service
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/auth/validate`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    logger.info('Auth service response:', response.data);

    if (response.data.user) {
      req.user = response.data.user;
      next();
    } else {
      logger.error('Invalid response from auth service:', response.data);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    if (axios.isAxiosError(error)) {
      logger.error('Auth service error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
}; 