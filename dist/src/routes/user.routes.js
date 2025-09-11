"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRouter = (0, express_1.Router)();
userRouter.use(auth_middleware_1.protect);
userRouter.get("/profile", user_controller_1.fetchUserById);
exports.default = userRouter;
