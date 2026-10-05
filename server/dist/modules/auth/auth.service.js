"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_js_1 = require("./user.model.js");
const env_js_1 = require("../../config/env.js");
const appErrors_js_1 = require("../../errors/appErrors.js");
class AuthService {
    static generateToken(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, { expiresIn: env_js_1.env.JWT_EXPIRES_IN });
    }
    static async register(data) {
        const existing = await user_model_js_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new appErrors_js_1.ConflictError('User with this email already exists');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
        const user = await user_model_js_1.User.create({
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            role: data.role || 'USER',
        });
        const token = this.generateToken(user);
        return { token, user };
    }
    static async login(data) {
        const user = await user_model_js_1.User.findOne({ email: data.email.toLowerCase() });
        if (!user) {
            throw new appErrors_js_1.UnauthorizedError('Invalid email or password');
        }
        const isMatch = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new appErrors_js_1.UnauthorizedError('Invalid email or password');
        }
        const token = this.generateToken(user);
        return { token, user };
    }
    static async me(userId) {
        const user = await user_model_js_1.User.findById(userId);
        if (!user) {
            throw new appErrors_js_1.NotFoundError('User profile not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
