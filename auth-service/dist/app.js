"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
// Configure Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.AUTH_SERVICE_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        done(null, profile);
    }
    catch (error) {
        done(error);
    }
}));
// Routes
app.use('/auth', authRoutes_1.default);
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://auth-admin:password01@localhost:32768/auth-service';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Start server only after successful DB connection
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Auth service running on port ${PORT}`);
        console.log(`CORS enabled for origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
