"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const write_routes_1 = require("./routes/write.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/write', auth_middleware_1.authMiddleware, write_routes_1.writeRouter);
// Error handling
app.use(error_middleware_1.errorHandler);
app.listen(port, () => {
    logger_1.logger.info(`Write service listening on port ${port}`);
});
