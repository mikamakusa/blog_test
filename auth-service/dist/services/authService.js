"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const strapiService_1 = require("./strapiService");
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.strapiService = new strapiService_1.StrapiService();
    }
    async registerUser(email, password, name) {
        console.log('Starting user registration for:', email);
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Create user in MongoDB
        const user = new User_1.User({ email, password, name });
        await user.save();
        console.log('User saved to MongoDB:', user._id);
        // Try to create user in Strapi (non-blocking)
        try {
            await this.strapiService.createStrapiUser({
                email,
                name,
            });
            console.log('User created in Strapi');
        }
        catch (error) {
            console.error('Failed to create Strapi user:', error);
            // Continue with registration even if Strapi sync fails
        }
        const token = this.generateToken(user);
        return { user, token };
    }
    async loginUser(email, password) {
        console.log('Attempting login for user:', email);
        // Include password in the query using select('+password')
        const user = await User_1.User.findOne({ email }).select('+password');
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
        }
        catch (error) {
            console.error('Strapi sync error during login:', error);
            // Continue login process even if Strapi sync fails
        }
        console.log('Login successful, generating token');
        const token = this.generateToken(user);
        // Remove password from user object before returning
        user.password = undefined;
        return { user, token };
    }
    async googleLogin(profile) {
        const { email, name, sub: googleId } = profile;
        console.log('Google login attempt for:', email);
        let user = await User_1.User.findOne({ googleId });
        if (!user) {
            // Check if user exists with same email
            user = await User_1.User.findOne({ email });
            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                await user.save();
                console.log('Linked Google account to existing user');
            }
            else {
                // Create new user
                user = await User_1.User.create({
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
            }
            else {
                await this.strapiService.updateStrapiUser(strapiUser.id, {
                    provider: 'google',
                    providerId: googleId,
                });
                console.log('Updated Strapi user with Google info');
            }
        }
        catch (error) {
            console.error('Failed to sync Google user with Strapi:', error);
            // Continue login process even if Strapi sync fails
        }
        const token = this.generateToken(user);
        return { user, token };
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return await User_1.User.findById(decoded.id);
        }
        catch (error) {
            return null;
        }
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id }, this.jwtSecret, {
            expiresIn: '7d',
        });
    }
}
exports.AuthService = AuthService;
