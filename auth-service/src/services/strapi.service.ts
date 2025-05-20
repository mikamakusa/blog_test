import axios from 'axios';
import { strapiConfig } from '../config/strapi';

export class StrapiService {
  private readonly baseUrl: string;
  private readonly apiToken: string | undefined;

  constructor() {
    this.baseUrl = strapiConfig.baseUrl;
    this.apiToken = strapiConfig.apiToken;
  }

  private get headers() {
    return {
      ...(this.apiToken && { Authorization: `Bearer ${this.apiToken}` }),
      'Content-Type': 'application/json',
    };
  }

  async syncUser(userData: {
    email: string;
    username: string;
    password: string;
  }): Promise<any> {
    try {
      if (!this.apiToken) {
        console.log('Strapi sync skipped: No API token provided');
        return null;
      }

      // First, check if user exists
      const existingUser = await this.findUserByEmail(userData.email);

      if (existingUser) {
        // Update existing user
        return await this.updateUser(existingUser.id, userData);
      } else {
        // Create new user
        const user = await this.createUser(userData);
        
        // Create author for the user
        if (user) {
          await this.createAuthor(user.id, userData.username);
        }
        
        return user;
      }
    } catch (error) {
      console.error('Strapi sync error:', error);
      // Don't throw the error - we want the auth service to work even if Strapi sync fails
      return null;
    }
  }

  private async findUserByEmail(email: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}${strapiConfig.endpoints.users}?filters[email][$eq]=${email}`,
        { headers: this.headers }
      );
      return response.data?.[0];
    } catch (error) {
      console.error('Error finding user in Strapi:', error);
      return null;
    }
  }

  private async createUser(userData: {
    email: string;
    username: string;
    password: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}${strapiConfig.endpoints.users}`,
        {
          data: {
            ...userData,
            confirmed: true,
            blocked: false,
          },
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user in Strapi:', error);
      throw error;
    }
  }

  private async createAuthor(userId: number, name: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/authors`,
        {
          data: {
            name,
            user: userId,
          },
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating author in Strapi:', error);
      throw error;
    }
  }

  private async updateUser(
    id: number,
    userData: {
      email: string;
      username: string;
      password: string;
    }
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${this.baseUrl}${strapiConfig.endpoints.users}/${id}`,
        {
          data: userData,
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user in Strapi:', error);
      throw error;
    }
  }
} 