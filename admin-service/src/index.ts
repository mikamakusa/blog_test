import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { adminRouter } from './routes/admin.routes';
import adsRouter from './routes/ads';
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import * as process from "node:process";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Serve static files from the views directory
app.use('/api/admin/static', express.static(path.join(__dirname, 'views')));

// Mount admin routes with auth middleware
app.use('/api/admin', adminRouter);

// Mount ads routes
app.use('/api/admin/ads', adsRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
    logger.info(`Admin service listening on port ${port}`);
    logger.info(`Views directory: ${path.join(__dirname, 'views')}`);
    logger.info(`Current directory: ${__dirname}`);
    logger.info('Strapi token available:', process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? 'Yes' : 'No');
});