"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserByUsernameOrEmail = exports.getUserById = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const createUser = async (userData) => {
    try {
        const user = new user_model_1.default(userData);
        await user.save();
        return user;
    }
    catch (error) {
        console.error("Error creating user:", error);
        throw new Error(error);
    }
};
exports.createUser = createUser;
const getUserById = async (userId) => {
    try {
        const user = await user_model_1.default.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("User fetch failed");
    }
};
exports.getUserById = getUserById;
const getUserByUsernameOrEmail = async (username, email) => {
    try {
        const user = await user_model_1.default.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("Error fetching user by username or email:", error);
        throw new Error("User fetch by username or email failed");
    }
};
exports.getUserByUsernameOrEmail = getUserByUsernameOrEmail;
const updateUser = async (userId, updateData) => {
    try {
        const user = await user_model_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("Error updating user:", error);
        throw new Error("User update failed");
    }
};
exports.updateUser = updateUser;
const deleteUser = async (userId) => {
    try {
        const user = await user_model_1.default.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("User deletion failed");
    }
};
exports.deleteUser = deleteUser;
