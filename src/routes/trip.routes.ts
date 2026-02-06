import { Router } from 'express';
import { createTrip, getTripById, getTrips } from '../controllers/trip.controller';
import { protect } from '../middlewares/auth.middleware';

const tripRouter = Router();

tripRouter.use(protect);

tripRouter.post('/', createTrip);
tripRouter.get('/', getTrips);
tripRouter.get('/:id', getTripById);

export default tripRouter;
