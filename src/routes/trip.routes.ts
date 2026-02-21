import { Router } from 'express';
import {
  clearTripsAndItineraries,
  createTrip,
  getTripById,
  getTrips,
  updateTrip,
} from '../controllers/trip.controller';
import { protect, requireAdmin } from '../middlewares/auth.middleware';

const tripRouter = Router();

tripRouter.use(protect);

tripRouter.post('/', createTrip);
tripRouter.get('/', getTrips);
tripRouter.get('/:id', getTripById);
tripRouter.patch('/:id', updateTrip);
tripRouter.delete('/clear-all', clearTripsAndItineraries);


export default tripRouter;
