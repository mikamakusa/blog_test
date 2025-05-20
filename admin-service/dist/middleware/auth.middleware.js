"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        logger_1.logger.info('Auth middleware called for path:', req.path);
        logger_1.logger.info('Request headers:', req.headers);
        logger_1.logger.info('Request query:', req.query);
        let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        logger_1.logger.info('Token from Authorization header:', token ? 'Present' : 'Not present');
        if (!token && req.query.token) {
            token = req.query.token;
            logger_1.logger.info('Token from query parameter:', token ? 'Present' : 'Not present');
        }
        if (!token) {
            logger_1.logger.error('No token provided in request');
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        logger_1.logger.info('Verifying token with auth service...');
        logger_1.logger.info('Auth service URL:', `${process.env.AUTH_SERVICE_URL}/auth/validate`);
        const response = await axios_1.default.get(`${process.env.AUTH_SERVICE_URL}/auth/validate`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        logger_1.logger.info('Auth service response:', response.data);
        if (response.data.user) {
            req.user = response.data.user;
            logger_1.logger.info('Authentication successful for user:', response.data.user.email);
            next();
        }
        else {
            logger_1.logger.error('Invalid response from auth service:', response.data);
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        if (axios_1.default.isAxiosError(error)) {
            logger_1.logger.error('Auth service error:', {
                status: (_b = error.response) === null || _b === void 0 ? void 0 : _b.status,
                statusText: (_c = error.response) === null || _c === void 0 ? void 0 : _c.statusText,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
                config: {
                    url: (_e = error.config) === null || _e === void 0 ? void 0 : _e.url,
                    method: (_f = error.config) === null || _f === void 0 ? void 0 : _f.method,
                    headers: (_g = error.config) === null || _g === void 0 ? void 0 : _g.headers,
                },
            });
        }
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map