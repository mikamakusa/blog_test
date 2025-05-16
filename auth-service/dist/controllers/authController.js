"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authService = new authService_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            console.log('Register attempt for email:', email);
            const result = await authService.registerUser(email, password, name);
            res.json(result);
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
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
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message });
        }
    }
    async googleCallback(req, res) {
        try {
            console.log('Google callback received');
            const result = await authService.googleLogin(req.user);
            // Redirect to frontend with token
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback/google?token=${result.token}`;
            res.redirect(redirectUrl);
        }
        catch (error) {
            console.error('Google callback error:', error);
            res.status(401).json({ error: error.message });
        }
    }
    async validateToken(req, res) {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
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
        }
        catch (error) {
            console.error('Token validation error:', error);
            res.status(401).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
