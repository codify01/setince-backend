import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';

const categoriesRouter = Router();

categoriesRouter.get('/', listCategories);
categoriesRouter.post('/', protect, createCategory);
categoriesRouter.put('/:id', protect, updateCategory);
categoriesRouter.delete('/:id', protect, deleteCategory);

export default categoriesRouter;
