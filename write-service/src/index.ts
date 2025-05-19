import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { writeRouter } from './routes/write.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Public health check endpoint
app.get('/api/write/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Protected routes
app.use('/api/write', authMiddleware, writeRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Write service listening on port ${port}`);
}); 