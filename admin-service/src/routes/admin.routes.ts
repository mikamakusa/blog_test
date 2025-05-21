import { Router, Request, Response } from "express";
import axios from 'axios';
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { authMiddleware } from "../middleware/auth.middleware";
import path from 'path';
import * as process from "node:process";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok'});
});

// Serve the admin dashboard
router.get("/dashboard", (req: Request, res: Response) => {
    try {
        // Check for token in query parameters
        const token = req.query.token;
        if (!token) {
            logger.error('No token provided for dashboard access');
            return res.redirect('/login');
        }

        const dashboardPath = path.join(__dirname, '..', 'views', 'dashboard.html');
        logger.info('Attempting to serve dashboard from path:', dashboardPath);
        
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(dashboardPath)) {
            logger.error('Dashboard file not found at path:', dashboardPath);
            throw new AppError(404, 'Dashboard file not found');
        }
        
        res.sendFile(dashboardPath, (err) => {
            if (err) {
                logger.error('Error sending dashboard file:', err);
                throw new AppError(500, 'Error serving dashboard');
            }
        });
    } catch (error) {
        logger.error('Error in dashboard route:', error);
        throw error;
    }
});

// Serve the ads management page
router.get('/ads', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/ads.html'));
});

// API endpoints for admin functionality
router.get("/stats", async (_req: Request, res: Response) => {
    try {
        // Get stats from backend service
        const response = await axios.get(
            `${process.env.BACKEND_URL}/api/stats`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        logger.error('Error fetching stats:', error);
        throw new AppError(500, 'Failed to fetch stats');
    }
});

export const adminRouter = router;