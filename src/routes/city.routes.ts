import { Router } from 'express';
import { createCity, listCities } from '../controllers/city.controller';
import { protect, requireAdmin } from '../middlewares/auth.middleware';

const cityRouter = Router();

cityRouter.get('/', listCities);
cityRouter.post('/', protect, requireAdmin, createCity);

export default cityRouter;
