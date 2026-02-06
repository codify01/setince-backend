import { Router } from 'express';
import { createCategory, listCategories } from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';

const categoriesRouter = Router();

categoriesRouter.get('/', listCategories);
categoriesRouter.post('/', protect, createCategory);

export default categoriesRouter;
