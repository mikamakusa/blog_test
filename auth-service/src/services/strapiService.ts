import axios from 'axios';

export class StrapiService {
  private readonly strapiUrl: string;
  private readonly strapiToken: string;

  constructor() {
    this.strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    this.strapiToken = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';
  }

  private get apiClient() {
    return axios.create({
      baseURL: this.strapiUrl,
      headers: {
        'Authorization': `Bearer ${this.strapiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createStrapiUser(userData: {
    email: string;
    name: string;
    provider?: string;
    providerId?: string;
  }) {
    try {
      if (!this.strapiToken) {
        console.log('No Strapi API token provided, skipping user creation');
        return null;
      }

      const response = await this.apiClient.post('/api/users', {
        email: userData.email,
        username: userData.email,
        name: userData.name,
        provider: userData.provider || 'local',
        providerId: userData.providerId,
        confirmed: true,
        blocked: false,
        role: 1, // Authenticated role
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Strapi user:', error);
      return null;
    }
  }

  async findStrapiUser(email: string) {
    try {
      if (!this.strapiToken) {
        console.log('No Strapi API token provided, skipping user lookup');
        return null;
      }

      const response = await this.apiClient.get('/api/users', {
        params: {
          filters: {
            email: {
              $eq: email,
            },
          },
        },
      });

      const users = response.data?.data || [];
      return users[0] || null;
    } catch (error) {
      console.error('Error finding Strapi user:', error);
      return null;
    }
  }

  async updateStrapiUser(id: number, userData: {
    name?: string;
    provider?: string;
    providerId?: string;
  }) {
    try {
      if (!this.strapiToken) {
        console.log('No Strapi API token provided, skipping user update');
        return null;
      }

      const response = await this.apiClient.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating Strapi user:', error);
      return null;
    }
  }
} 