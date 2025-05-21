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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const admin_routes_1 = require("./routes/admin.routes");
const ads_1 = __importDefault(require("./routes/ads"));
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = require("./utils/logger");
const process = __importStar(require("node:process"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api/admin/static', express_1.default.static(path_1.default.join(__dirname, 'views')));
app.use('/api/admin', admin_routes_1.adminRouter);
app.use('/api/admin/ads', ads_1.default);
app.use(error_middleware_1.errorHandler);
app.listen(port, () => {
    logger_1.logger.info(`Admin service listening on port ${port}`);
    logger_1.logger.info(`Views directory: ${path_1.default.join(__dirname, 'views')}`);
    logger_1.logger.info(`Current directory: ${__dirname}`);
    logger_1.logger.info('Strapi token available:', process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? 'Yes' : 'No');
});
//# sourceMappingURL=index.js.map