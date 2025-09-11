"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const protect = async (req, res, next) => {
    let token;
    try {
        // Expect token in Authorization header as "Bearer <token>"
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token provided" });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
        // Attach user to request (excluding password field)
        const user = await user_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};
exports.protect = protect;
