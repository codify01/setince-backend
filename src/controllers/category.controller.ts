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
