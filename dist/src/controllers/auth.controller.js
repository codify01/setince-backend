"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginUser = exports.loginUser = exports.addUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userService_1 = require("../services/userService");
const generateToken_1 = require("../helpers/generateToken");
const addUser = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    try {
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await user_model_1.default.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            return res.status(409).json({
                message: existingUser.email === email
                    ? 'Email already exists'
                    : 'Username already exists',
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const newUser = await (0, userService_1.createUser)({
            firstName,
            lastName,
            username,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });
        const token = await (0, generateToken_1.generateToken)({ id: newUser._id, username: newUser.username, email: newUser.email });
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
            token
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'User creation failed', error: error.message });
    }
};
exports.addUser = addUser;
const loginUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await (0, userService_1.getUserByUsernameOrEmail)(username, email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        user.lastLogin = new Date();
        await user.save();
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePicture,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token: await (0, generateToken_1.generateToken)({ id: user._id, username: user.username, email: user.email })
        });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
exports.loginUser = loginUser;
const adminLoginUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await (0, userService_1.getUserByUsernameOrEmail)(username, email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== 'admin' && user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        user.lastLogin = new Date();
        await user.save();
        res.status(200).json({
            message: 'Admin login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePicture,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token: await (0, generateToken_1.generateToken)({ id: user._id, username: user.username, email: user.email })
        });
    }
    catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
exports.adminLoginUser = adminLoginUser;
