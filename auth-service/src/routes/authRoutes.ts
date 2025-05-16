import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// Helper to wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Local auth routes
router.post('/register', asyncHandler(async (req, res) => {
  await authController.register(req, res);
}));

router.post('/login', asyncHandler(async (req, res) => {
  await authController.login(req, res);
}));

router.get('/validate', asyncHandler(async (req, res) => {
  await authController.validateToken(req, res);
}));

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  asyncHandler(async (req, res) => {
    await authController.googleCallback(req, res);
  })
);

export default router; 