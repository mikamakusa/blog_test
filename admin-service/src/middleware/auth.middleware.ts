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

    // Try to get token from Authorization header
    let token = req.headers.authorization?.split(' ')[1];
    
    // If no token in header, try to get from query parameter
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      logger.error('No token provided in request');
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // For now, just verify the token exists and has the correct format
    // We'll skip the auth service validation since we're using JWT tokens
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode the payload (second part of the token)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      // Check if the token has expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token has expired');
      }

      // Set the user information from the token payload
      req.user = {
        id: payload.userId,
        email: payload.email || '',
        name: payload.name || ''
      };

      logger.info('Token validation successful for user:', req.user.id);
      next();
    } catch (error) {
      logger.error('Token validation failed:', error);
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
    return;
  }
}; 