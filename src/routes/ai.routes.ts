import { Router } from 'express';
import { createTripFromPrompt } from '../controllers/aiTrip.controller';
import { protect } from '../middlewares/auth.middleware';

const aiRouter = Router();

aiRouter.post('/trips', protect, createTripFromPrompt);

export default aiRouter;
