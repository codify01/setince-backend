"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserByUsernameOrEmail = exports.fetchUserById = void 0;
const userService_1 = require("../services/userService");
const fetchUserById = async (req, res) => {
    try {
        const id = req.user._id;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await (0, userService_1.getUserById)(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'User fetch failed', error: error.message });
    }
};
exports.fetchUserById = fetchUserById;
const fetchUserByUsernameOrEmail = async (req, res) => {
    try {
        const { username, email } = req.query;
        if (!username && !email) {
            return res.status(400).json({ message: 'Username or Email is required' });
        }
        const user = await (0, userService_1.getUserByUsernameOrEmail)(username, email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user
        });
    }
    catch (error) {
        console.error('Error fetching user by username or email:', error);
        res.status(500).json({ message: 'User fetch by username or email failed', error: error.message });
    }
};
exports.fetchUserByUsernameOrEmail = fetchUserByUsernameOrEmail;
