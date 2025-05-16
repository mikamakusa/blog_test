"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrapiService = void 0;
const axios_1 = __importDefault(require("axios"));
class StrapiService {
    constructor() {
        this.strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
        this.strapiToken = process.env.STRAPI_API_TOKEN || '';
    }
    get apiClient() {
        return axios_1.default.create({
            baseURL: this.strapiUrl,
            headers: {
                'Authorization': `Bearer ${this.strapiToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async createStrapiUser(userData) {
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
        }
        catch (error) {
            console.error('Error creating Strapi user:', error);
            return null;
        }
    }
    async findStrapiUser(email) {
        var _a;
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
            const users = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || [];
            return users[0] || null;
        }
        catch (error) {
            console.error('Error finding Strapi user:', error);
            return null;
        }
    }
    async updateStrapiUser(id, userData) {
        try {
            if (!this.strapiToken) {
                console.log('No Strapi API token provided, skipping user update');
                return null;
            }
            const response = await this.apiClient.put(`/api/users/${id}`, userData);
            return response.data;
        }
        catch (error) {
            console.error('Error updating Strapi user:', error);
            return null;
        }
    }
}
exports.StrapiService = StrapiService;
