"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_js_1.AuthService.register(req.body);
            res.status(201).json({
                message: 'User registered successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await auth_service_js_1.AuthService.login(req.body);
            res.status(200).json({
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const user = await auth_service_js_1.AuthService.me(req.user.userId);
            res.status(200).json({
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
