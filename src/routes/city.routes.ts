import { Router } from 'express';
import { createCity, listCities } from '../controllers/city.controller';
import { protect } from '../middlewares/auth.middleware';

const cityRouter = Router();

cityRouter.get('/', listCities);
cityRouter.post('/', protect, createCity);

export default cityRouter;
