"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.listCategories = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const responseHelper_1 = require("../helpers/responseHelper");
const listCategories = async (_req, res) => {
    try {
        const categories = await category_model_1.default.find({ isActive: true }).sort({
            title: 1,
        });
        return (0, responseHelper_1.sendSuccess)(res, 'Categories fetched successfully', categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching categories', 500, error?.message);
    }
};
exports.listCategories = listCategories;
const createCategory = async (req, res) => {
    try {
        const { title, value, image, icon, isActive } = req.body;
        if (!title || !value) {
            return (0, responseHelper_1.sendError)(res, 'Title and value are required', 400);
        }
        const category = await category_model_1.default.create({
            title,
            value,
            image,
            icon,
            isActive,
        });
        return (0, responseHelper_1.sendSuccess)(res, 'Category created successfully', category, 201);
    }
    catch (error) {
        console.error('Error creating category:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating category', 500, error?.message);
    }
};
exports.createCategory = createCategory;
