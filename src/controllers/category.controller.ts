import CategoryModel from '../models/category.model';
import { sendError, sendSuccess } from '../helpers/responseHelper';

export const listCategories = async (_req, res) => {
  try {
    const categories = await CategoryModel.find({ isActive: true }).sort({
      title: 1,
    });
    return sendSuccess(res, 'Categories fetched successfully', categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return sendError(res, 'Server error while fetching categories', 500, error?.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { title, value, image, icon, isActive } = req.body;
    if (!title || !value) {
      return sendError(res, 'Title and value are required', 400);
    }

    const category = await CategoryModel.create({
      title,
      value,
      image,
      icon,
      isActive,
    });

    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return sendError(res, 'Server error while creating category', 500, error?.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendError(res, 'Category ID is required', 400);
    }

    const updateData = req.body ?? {};
    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No data provided for update', 400);
    }

    updateData.updatedAt = new Date();

    const category = await CategoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, 'Category updated successfully', category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    return sendError(res, 'Server error while updating category', 500, error?.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendError(res, 'Category ID is required', 400);
    }

    const category = await CategoryModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, 'Category deleted successfully', category);
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return sendError(res, 'Server error while deleting category', 500, error?.message);
  }
};
