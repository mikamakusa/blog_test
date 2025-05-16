import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      console.log('Register attempt for email:', email);
      const result = await authService.registerUser(email, password, name);
      res.json(result);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      console.log('Login request body:', req.body);
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.error('Missing credentials - Email:', !!email, 'Password:', !!password);
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log('Attempting login for email:', email);
      const result = await authService.loginUser(email, password);
      console.log('Login successful for email:', email);
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async googleCallback(req: Request, res: Response) {
    try {
      console.log('Google callback received');
      const result = await authService.googleLogin(req.user);
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback/google?token=${result.token}`;
      res.redirect(redirectUrl);
    } catch (error: any) {
      console.error('Google callback error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async validateToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        console.error('No token provided in request');
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = await authService.validateToken(token);
      if (!user) {
        console.error('Invalid token provided');
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ user });
    } catch (error: any) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: error.message });
    }
  }
} 