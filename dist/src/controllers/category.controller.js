"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = void 0;
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
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return (0, responseHelper_1.sendError)(res, 'Category ID is required', 400);
        }
        const updateData = req.body ?? {};
        if (Object.keys(updateData).length === 0) {
            return (0, responseHelper_1.sendError)(res, 'No data provided for update', 400);
        }
        updateData.updatedAt = new Date();
        const category = await category_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            return (0, responseHelper_1.sendError)(res, 'Category not found', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Category updated successfully', category);
    }
    catch (error) {
        console.error('Error updating category:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while updating category', 500, error?.message);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return (0, responseHelper_1.sendError)(res, 'Category ID is required', 400);
        }
        const category = await category_model_1.default.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true });
        if (!category) {
            return (0, responseHelper_1.sendError)(res, 'Category not found', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Category deleted successfully', category);
    }
    catch (error) {
        console.error('Error deleting category:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while deleting category', 500, error?.message);
    }
};
exports.deleteCategory = deleteCategory;
