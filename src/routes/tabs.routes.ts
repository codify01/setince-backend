import { Router } from 'express';
import {
  getExploreTab,
  getHomeTab,
  getProfileTab,
  getSavedTab,
  getTripsTab,
} from '../controllers/tabs.controller';
import { protect } from '../middlewares/auth.middleware';

const tabsRouter = Router();

// tabsRouter.use(protect);

tabsRouter.get('/home', getHomeTab);
tabsRouter.get('/explore', getExploreTab);
tabsRouter.get('/trips', getTripsTab);
tabsRouter.get('/profile', getProfileTab);
tabsRouter.get('/saved', getSavedTab);

export default tabsRouter;
