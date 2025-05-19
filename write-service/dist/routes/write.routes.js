"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
const postSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    content: zod_1.z.string().min(1),
    excerpt: zod_1.z.string().max(500).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    published: zod_1.z.boolean().optional(),
});
router.post('/posts', async (req, res, next) => {
    try {
        const validatedData = postSchema.parse(req.body);
        const response = await axios_1.default.post(`${process.env.BACKEND_URL}/api/posts`, {
            data: {
                ...validatedData,
                author: req.user?.id,
            },
        }, {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
        });
        res.status(201).json(response.data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next(new error_middleware_1.AppError(400, 'Invalid input data'));
        }
        else {
            logger_1.logger.error('Error creating post:', error);
            next(new error_middleware_1.AppError(500, 'Error creating post'));
        }
    }
});
router.put('/posts/:id', async (req, res, next) => {
    try {
        const validatedData = postSchema.parse(req.body);
        const response = await axios_1.default.put(`${process.env.BACKEND_URL}/api/posts/${req.params.id}`, {
            data: validatedData,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            next(new error_middleware_1.AppError(400, 'Invalid input data'));
        }
        else {
            logger_1.logger.error('Error updating post:', error);
            next(new error_middleware_1.AppError(500, 'Error updating post'));
        }
    }
});
router.delete('/posts/:id', async (req, res, next) => {
    try {
        await axios_1.default.delete(`${process.env.BACKEND_URL}/api/posts/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error('Error deleting post:', error);
        next(new error_middleware_1.AppError(500, 'Error deleting post'));
    }
});
exports.writeRouter = router;
