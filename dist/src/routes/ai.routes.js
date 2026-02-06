"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiTrip_controller_1 = require("../controllers/aiTrip.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const aiRouter = (0, express_1.Router)();
aiRouter.post('/trips', auth_middleware_1.protect, aiTrip_controller_1.createTripFromPrompt);
exports.default = aiRouter;
