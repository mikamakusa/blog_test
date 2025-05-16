"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password is required only if not using Google auth
        },
        select: false, // Don't include password in queries by default
    },
    name: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allow null/undefined values
    },
}, {
    timestamps: true,
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password') || !this.password) {
            return next();
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        if (!this.password)
            return false;
        // Log for debugging
        console.log('Comparing passwords...');
        console.log('Candidate password length:', candidatePassword.length);
        console.log('Stored password length:', this.password.length);
        const isMatch = await bcryptjs_1.default.compare(candidatePassword, this.password);
        console.log('Password match result:', isMatch);
        return isMatch;
    }
    catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};
exports.User = mongoose_1.default.model('User', userSchema);
