"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../utils/logger");
const auth_middleware_1 = require("../middleware/auth.middleware");
const path_1 = __importDefault(require("path"));
const process = __importStar(require("node:process"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get("/health", (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
router.get("/dashboard", (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            logger_1.logger.error('No token provided for dashboard access');
            return res.redirect('/login');
        }
        const dashboardPath = path_1.default.join(__dirname, '..', 'views', 'dashboard.html');
        logger_1.logger.info('Attempting to serve dashboard from path:', dashboardPath);
        const fs = require('fs');
        if (!fs.existsSync(dashboardPath)) {
            logger_1.logger.error('Dashboard file not found at path:', dashboardPath);
            throw new error_middleware_1.AppError(404, 'Dashboard file not found');
        }
        res.sendFile(dashboardPath, (err) => {
            if (err) {
                logger_1.logger.error('Error sending dashboard file:', err);
                throw new error_middleware_1.AppError(500, 'Error serving dashboard');
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in dashboard route:', error);
        throw error;
    }
});
router.get('/ads', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../views/ads.html'));
});
router.get("/stats", async (_req, res) => {
    try {
        const response = await axios_1.default.get(`${process.env.BACKEND_URL}/api/stats`, {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        logger_1.logger.error('Error fetching stats:', error);
        throw new error_middleware_1.AppError(500, 'Failed to fetch stats');
    }
});
exports.adminRouter = router;
//# sourceMappingURL=admin.routes.js.map