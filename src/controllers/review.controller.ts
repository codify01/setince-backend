import mongoose from 'mongoose';
import ReviewModel from '../models/review.model';
import PlacesModel from '../models/places.model';
import { sendError, sendSuccess } from '../helpers/responseHelper';

const recomputePlaceRatings = async (placeId: string) => {
  const stats = await ReviewModel.aggregate([
    { $match: { place: new mongoose.Types.ObjectId(placeId) } },
    {
      $group: {
        _id: '$place',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 },
      },
    },
  ]);

  const summary = stats[0] || { averageRating: 0, numberOfRatings: 0 };
  await PlacesModel.findByIdAndUpdate(placeId, {
    ratings: {
      averageRating: Number(summary.averageRating || 0),
      numberOfRatings: Number(summary.numberOfRatings || 0),
    },
  });
};

export const createReview = async (req, res) => {
  try {
    const { placeId, rating, comment, images } = req.body;
    if (!placeId || rating === undefined) {
      return sendError(res, 'placeId and rating are required', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return sendError(res, 'Invalid placeId', 400);
    }

    const place = await PlacesModel.findById(placeId);
    if (!place) {
      return sendError(res, 'Place not found', 404);
    }

    const review = await ReviewModel.create({
      place: placeId,
      user: req.user._id,
      rating,
      comment,
      images,
    });

    await recomputePlaceRatings(placeId);

    return sendSuccess(res, 'Review created successfully', review, 201);
  } catch (error: any) {
    if (error?.code === 11000) {
      return sendError(res, 'You already reviewed this place', 409);
    }
    console.error('Error creating review:', error);
    return sendError(res, 'Server error while creating review', 500, error?.message);
  }
};

export const listReviewsForPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    if (!placeId) {
      return sendError(res, 'placeId is required', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return sendError(res, 'Invalid placeId', 400);
    }

    const reviews = await ReviewModel.find({ place: placeId })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName username profilePicture');

    return sendSuccess(res, 'Reviews fetched successfully', reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return sendError(res, 'Server error while fetching reviews', 500, error?.message);
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid review id', 400);
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      return sendError(res, 'Review not found', 404);
    }
    if (String(review.user) !== String(req.user._id)) {
      return sendError(res, 'Not allowed to update this review', 403);
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();
    await recomputePlaceRatings(String(review.place));

    return sendSuccess(res, 'Review updated successfully', review);
  } catch (error: any) {
    console.error('Error updating review:', error);
    return sendError(res, 'Server error while updating review', 500, error?.message);
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid review id', 400);
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      return sendError(res, 'Review not found', 404);
    }
    if (String(review.user) !== String(req.user._id)) {
      return sendError(res, 'Not allowed to delete this review', 403);
    }

    await review.deleteOne();
    await recomputePlaceRatings(String(review.place));

    return sendSuccess(res, 'Review deleted successfully');
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return sendError(res, 'Server error while deleting review', 500, error?.message);
  }
};

export const recomputeAllRatings = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return sendError(res, 'Only admin can recompute ratings', 403);
    }

    const stats = await ReviewModel.aggregate([
      {
        $group: {
          _id: '$place',
          averageRating: { $avg: '$rating' },
          numberOfRatings: { $sum: 1 },
        },
      },
    ]);

    const bulk = stats.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          ratings: {
            averageRating: Number(item.averageRating || 0),
            numberOfRatings: Number(item.numberOfRatings || 0),
          },
        },
      },
    }));

    if (bulk.length > 0) {
      await PlacesModel.bulkWrite(bulk);
    }

    return sendSuccess(res, 'Ratings recomputed successfully', {
      updated: bulk.length,
    });
  } catch (error: any) {
    console.error('Error recomputing ratings:', error);
    return sendError(res, 'Server error while recomputing ratings', 500, error?.message);
  }
};
