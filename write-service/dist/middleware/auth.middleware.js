"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        // Verify token with auth service
        const response = await axios_1.default.post(`${process.env.AUTH_SERVICE_URL}/api/auth/verify`, { token });
        if (response.data.valid) {
            req.user = response.data.user;
            next();
        }
        else {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.authMiddleware = authMiddleware;
