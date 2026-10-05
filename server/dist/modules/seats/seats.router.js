"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seatsRouter = void 0;
const express_1 = require("express");
const seats_controller_1 = require("./seats.controller");
const auth_1 = require("../../middleware/auth");
exports.seatsRouter = (0, express_1.Router)();
exports.seatsRouter.post('/lock', auth_1.authenticateToken, seats_controller_1.SeatsController.lock);
exports.seatsRouter.post('/release', auth_1.authenticateToken, seats_controller_1.SeatsController.release);
