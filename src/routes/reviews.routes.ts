import { Router } from 'express';
import {
  createReview,
  deleteReview,
  listReviewsForPlace,
  recomputeAllRatings,
  updateReview,
} from '../controllers/review.controller';
import { protect, requireAdmin } from '../middlewares/auth.middleware';

const reviewsRouter = Router();

reviewsRouter.get('/place/:placeId', listReviewsForPlace);
reviewsRouter.post('/', protect, createReview);
reviewsRouter.put('/:id', protect, updateReview);
reviewsRouter.delete('/:id', protect, deleteReview);
reviewsRouter.post('/recompute', protect, requireAdmin, recomputeAllRatings);

export default reviewsRouter;
