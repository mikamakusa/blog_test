import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { StrapiService } from './strapiService';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly strapiService: StrapiService;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.strapiService = new StrapiService();
  }

  async registerUser(email: string, password: string, name: string): Promise<{ user: IUser; token: string }> {
    console.log('Starting user registration for:', email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user in MongoDB
    const user = new User({ email, password, name });
    await user.save();
    console.log('User saved to MongoDB:', user._id);

    // Try to create user in Strapi (non-blocking)
    try {
      await this.strapiService.createStrapiUser({
        email,
        name,
      });
      console.log('User created in Strapi');
    } catch (error) {
      console.error('Failed to create Strapi user:', error);
      // Continue with registration even if Strapi sync fails
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async loginUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
    console.log('Attempting login for user:', email);
    
    // Include password in the query using select('+password')
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('No user found with email:', email);
      throw new Error('Invalid credentials');
    }

    console.log('Checking password...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      throw new Error('Invalid credentials');
    }

    // Try to sync with Strapi (non-blocking)
    try {
      const strapiUser = await this.strapiService.findStrapiUser(email);
      if (!strapiUser) {
        await this.strapiService.createStrapiUser({
          email: user.email,
          name: user.name,
        });
        console.log('Created missing Strapi user');
      }
    } catch (error) {
      console.error('Strapi sync error during login:', error);
      // Continue login process even if Strapi sync fails
    }

    console.log('Login successful, generating token');
    const token = this.generateToken(user);
    
    // Remove password from user object before returning
    user.password = undefined;
    return { user, token };
  }

  async googleLogin(profile: any): Promise<{ user: IUser; token: string }> {
    const { email, name, sub: googleId } = profile;
    console.log('Google login attempt for:', email);
    
    let user = await User.findOne({ googleId });
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email });
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        await user.save();
        console.log('Linked Google account to existing user');
      } else {
        // Create new user
        user = await User.create({
          email,
          name,
          googleId,
        });
        console.log('Created new user with Google account');
      }
    }

    // Try to sync with Strapi (non-blocking)
    try {
      const strapiUser = await this.strapiService.findStrapiUser(email);
      if (!strapiUser) {
        await this.strapiService.createStrapiUser({
          email,
          name,
          provider: 'google',
          providerId: googleId,
        });
        console.log('Created Strapi user for Google login');
      } else {
        await this.strapiService.updateStrapiUser(strapiUser.id, {
          provider: 'google',
          providerId: googleId,
        });
        console.log('Updated Strapi user with Google info');
      }
    } catch (error) {
      console.error('Failed to sync Google user with Strapi:', error);
      // Continue login process even if Strapi sync fails
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async validateToken(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string };
      return await User.findById(decoded.id);
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: IUser): string {
    return jwt.sign({ id: user.id }, this.jwtSecret, {
      expiresIn: '7d',
    });
  }
} 