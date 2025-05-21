"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const STRAPI_URL = process.env.BACKEND_URL || 'http://localhost:1337';
router.use(auth_middleware_1.authMiddleware);
router.get('/', async (req, res) => {
    try {
        const response = await axios_1.default.get(`${STRAPI_URL}/api/ads`, {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
            }
        });
        res.json(response.data.data);
    }
    catch (error) {
        logger_1.logger.error('Error fetching ads:', error);
        res.status(500).json({ error: 'Failed to fetch ads' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const response = await axios_1.default.get(`${STRAPI_URL}/api/ads/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
            }
        });
        res.json(response.data.data);
    }
    catch (error) {
        logger_1.logger.error('Error fetching ad:', error);
        res.status(500).json({ error: 'Failed to fetch ad' });
    }
});
router.post('/', async (req, res) => {
    var _a, _b;
    try {
        logger_1.logger.info('Received ad creation request');
        logger_1.logger.info('Request headers:', req.headers);
        logger_1.logger.info('Raw request body:', req.body);
        logger_1.logger.info('Content-Type:', req.headers['content-type']);
        const requiredFields = ['title', 'description', 'image_url', 'target_url', 'start_date', 'end_date', 'position', 'priority'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            logger_1.logger.error('Missing required fields:', missingFields);
            logger_1.logger.error('Available fields:', Object.keys(req.body));
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }
        const adData = {
            data: {
                title: req.body.title,
                description: req.body.description,
                image_url: req.body.image_url,
                target_url: req.body.target_url,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                position: req.body.position,
                priority: parseInt(req.body.priority, 10),
                is_active: req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 'on'
            }
        };
        logger_1.logger.info('Formatted ad data for Strapi:', adData);
        const response = await axios_1.default.post(`${STRAPI_URL}/api/ads`, adData, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        logger_1.logger.info('Strapi response:', response.data);
        res.status(201).json(response.data.data);
    }
    catch (error) {
        logger_1.logger.error('Error creating ad:', error);
        if (axios_1.default.isAxiosError(error)) {
            logger_1.logger.error('Strapi error response:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            logger_1.logger.error('Request data:', (_b = error.config) === null || _b === void 0 ? void 0 : _b.data);
        }
        res.status(400).json({ error: 'Failed to create ad' });
    }
});
router.put('/:id', async (req, res) => {
    var _a;
    try {
        const response = await axios_1.default.put(`${STRAPI_URL}/api/ads/${req.params.id}`, {
            data: {
                title: req.body.title,
                description: req.body.description,
                image_url: req.body.image_url,
                target_url: req.body.target_url,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                position: req.body.position,
                priority: req.body.priority,
                is_active: req.body.is_active
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
            }
        });
        res.json(response.data.data);
    }
    catch (error) {
        logger_1.logger.error('Error updating ad:', error);
        if (axios_1.default.isAxiosError(error)) {
            logger_1.logger.error('Strapi error response:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
        }
        res.status(400).json({ error: 'Failed to update ad' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        await axios_1.default.delete(`${STRAPI_URL}/api/ads/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
            }
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error('Error deleting ad:', error);
        res.status(500).json({ error: 'Failed to delete ad' });
    }
});
exports.default = router;
//# sourceMappingURL=ads.js.map