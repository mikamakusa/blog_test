"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    var _a;
    try {
        logger_1.logger.info('Auth middleware called for path:', req.path);
        let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token && req.query.token) {
            token = req.query.token;
        }
        if (!token) {
            logger_1.logger.error('No token provided in request');
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                throw new Error('Token has expired');
            }
            req.user = {
                id: payload.userId,
                email: payload.email || '',
                name: payload.name || ''
            };
            logger_1.logger.info('Token validation successful for user:', req.user.id);
            next();
        }
        catch (error) {
            logger_1.logger.error('Token validation failed:', error);
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map