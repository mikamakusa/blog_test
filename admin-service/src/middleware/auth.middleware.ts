import { Request, Response, NextFunction } from 'express';
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
): Promise<void> => {
  try {
    logger.info('Auth middleware called for path:', req.path);
    logger.info('Request headers:', req.headers);
    logger.info('Request query:', req.query);

    // Try to get token from Authorization header
    let token = req.headers.authorization?.split(' ')[1];
    logger.info('Token from Authorization header:', token ? 'Present' : 'Not present');
    
    // If no token in header, try to get from query parameter
    if (!token && req.query.token) {
      token = req.query.token as string;
      logger.info('Token from query parameter:', token ? 'Present' : 'Not present');
    }

    if (!token) {
      logger.error('No token provided in request');
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    logger.info('Verifying token with auth service...');
    logger.info('Auth service URL:', `${process.env.AUTH_SERVICE_URL}/auth/validate`);

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
      logger.info('Authentication successful for user:', response.data.user.email);
      next();
    } else {
      logger.error('Invalid response from auth service:', response.data);
      res.status(401).json({ message: 'Invalid token' });
      return;
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
    res.status(401).json({ message: 'Authentication failed' });
    return;
  }
}; 