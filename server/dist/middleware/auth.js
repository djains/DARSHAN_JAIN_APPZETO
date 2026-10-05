"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const appErrors_js_1 = require("../errors/appErrors.js");
const authenticateToken = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new appErrors_js_1.UnauthorizedError('Missing or malformed authorization token');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new appErrors_js_1.UnauthorizedError('Invalid or expired authentication token');
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (role) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new appErrors_js_1.UnauthorizedError('User authentication required');
        }
        if (req.user.role !== role) {
            throw new appErrors_js_1.ForbiddenError(`Access denied. Requires ${role} role.`);
        }
        next();
    };
};
exports.requireRole = requireRole;
