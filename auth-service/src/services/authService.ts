import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { StrapiService } from './strapi.service';

export class AuthService {
  private strapiService: StrapiService;
  private readonly jwtSecret: string;

  constructor() {
    this.strapiService = new StrapiService();
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret';
  }

  async registerUser(email: string, password: string, name: string) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in MongoDB
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        this.jwtSecret as jwt.Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Sync with Strapi (non-blocking)
      this.strapiService.syncUser({
        email,
        username: email, // Using email as username for simplicity
        password, // Send original password as Strapi will hash it
      }).catch(error => {
        console.error('Strapi sync error during registration:', error);
      });

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      // Find user in MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        this.jwtSecret as jwt.Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Sync with Strapi (non-blocking)
      this.strapiService.syncUser({
        email,
        username: email, // Using email as username for simplicity
        password, // Send original password as Strapi will hash it
      }).catch(error => {
        console.error('Strapi sync error during login:', error);
      });

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        this.jwtSecret
      ) as { userId: string };

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  async googleLogin(googleUser: any) {
    try {
      if (!googleUser?.emails?.[0]?.value) {
        throw new Error('No email provided from Google');
      }

      const email = googleUser.emails[0].value;
      const name = googleUser.displayName || email.split('@')[0];

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        // Create random password for Google users
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await User.create({
          email,
          password: hashedPassword,
          name,
          googleId: googleUser.id,
        });

        // Sync with Strapi (non-blocking)
        this.strapiService.syncUser({
          email,
          username: email,
          password: randomPassword, // Send random password to Strapi
        }).catch(error => {
          console.error('Strapi sync error during Google login:', error);
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        this.jwtSecret as jwt.Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }
} 