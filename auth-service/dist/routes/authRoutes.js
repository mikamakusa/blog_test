"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
// Helper to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
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
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), asyncHandler(async (req, res) => {
    await authController.googleCallback(req, res);
}));
exports.default = router;
