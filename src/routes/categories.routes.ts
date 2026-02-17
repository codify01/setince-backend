import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/category.controller';
import { protect, requireAdmin } from '../middlewares/auth.middleware';

const categoriesRouter = Router();

categoriesRouter.get('/', listCategories);
categoriesRouter.post('/', protect, requireAdmin, createCategory);
categoriesRouter.put('/:id', protect, requireAdmin, updateCategory);
categoriesRouter.delete('/:id', protect, requireAdmin, deleteCategory);

export default categoriesRouter;
