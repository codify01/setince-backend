"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeAllRatings = exports.deleteReview = exports.updateReview = exports.listReviewsForPlace = exports.createReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const review_model_1 = __importDefault(require("../models/review.model"));
const places_model_1 = __importDefault(require("../models/places.model"));
const responseHelper_1 = require("../helpers/responseHelper");
const recomputePlaceRatings = async (placeId) => {
    const stats = await review_model_1.default.aggregate([
        { $match: { place: new mongoose_1.default.Types.ObjectId(placeId) } },
        {
            $group: {
                _id: '$place',
                averageRating: { $avg: '$rating' },
                numberOfRatings: { $sum: 1 },
            },
        },
    ]);
    const summary = stats[0] || { averageRating: 0, numberOfRatings: 0 };
    await places_model_1.default.findByIdAndUpdate(placeId, {
        ratings: {
            averageRating: Number(summary.averageRating || 0),
            numberOfRatings: Number(summary.numberOfRatings || 0),
        },
    });
};
const createReview = async (req, res) => {
    try {
        const { placeId, rating, comment, images } = req.body;
        if (!placeId || rating === undefined) {
            return (0, responseHelper_1.sendError)(res, 'placeId and rating are required', 400);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(placeId)) {
            return (0, responseHelper_1.sendError)(res, 'Invalid placeId', 400);
        }
        const place = await places_model_1.default.findById(placeId);
        if (!place) {
            return (0, responseHelper_1.sendError)(res, 'Place not found', 404);
        }
        const review = await review_model_1.default.create({
            place: placeId,
            user: req.user._id,
            rating,
            comment,
            images,
        });
        await recomputePlaceRatings(placeId);
        return (0, responseHelper_1.sendSuccess)(res, 'Review created successfully', review, 201);
    }
    catch (error) {
        if (error?.code === 11000) {
            return (0, responseHelper_1.sendError)(res, 'You already reviewed this place', 409);
        }
        console.error('Error creating review:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating review', 500, error?.message);
    }
};
exports.createReview = createReview;
const listReviewsForPlace = async (req, res) => {
    try {
        const { placeId } = req.params;
        if (!placeId) {
            return (0, responseHelper_1.sendError)(res, 'placeId is required', 400);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(placeId)) {
            return (0, responseHelper_1.sendError)(res, 'Invalid placeId', 400);
        }
        const reviews = await review_model_1.default.find({ place: placeId })
            .sort({ createdAt: -1 })
            .populate('user', 'firstName lastName username profilePicture');
        return (0, responseHelper_1.sendSuccess)(res, 'Reviews fetched successfully', reviews);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching reviews', 500, error?.message);
    }
};
exports.listReviewsForPlace = listReviewsForPlace;
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, images } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return (0, responseHelper_1.sendError)(res, 'Invalid review id', 400);
        }
        const review = await review_model_1.default.findById(id);
        if (!review) {
            return (0, responseHelper_1.sendError)(res, 'Review not found', 404);
        }
        if (String(review.user) !== String(req.user._id)) {
            return (0, responseHelper_1.sendError)(res, 'Not allowed to update this review', 403);
        }
        if (rating !== undefined)
            review.rating = rating;
        if (comment !== undefined)
            review.comment = comment;
        if (images !== undefined)
            review.images = images;
        await review.save();
        await recomputePlaceRatings(String(review.place));
        return (0, responseHelper_1.sendSuccess)(res, 'Review updated successfully', review);
    }
    catch (error) {
        console.error('Error updating review:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while updating review', 500, error?.message);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return (0, responseHelper_1.sendError)(res, 'Invalid review id', 400);
        }
        const review = await review_model_1.default.findById(id);
        if (!review) {
            return (0, responseHelper_1.sendError)(res, 'Review not found', 404);
        }
        if (String(review.user) !== String(req.user._id)) {
            return (0, responseHelper_1.sendError)(res, 'Not allowed to delete this review', 403);
        }
        await review.deleteOne();
        await recomputePlaceRatings(String(review.place));
        return (0, responseHelper_1.sendSuccess)(res, 'Review deleted successfully');
    }
    catch (error) {
        console.error('Error deleting review:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while deleting review', 500, error?.message);
    }
};
exports.deleteReview = deleteReview;
const recomputeAllRatings = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return (0, responseHelper_1.sendError)(res, 'Only admin can recompute ratings', 403);
        }
        const stats = await review_model_1.default.aggregate([
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
            await places_model_1.default.bulkWrite(bulk);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Ratings recomputed successfully', {
            updated: bulk.length,
        });
    }
    catch (error) {
        console.error('Error recomputing ratings:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while recomputing ratings', 500, error?.message);
    }
};
exports.recomputeAllRatings = recomputeAllRatings;
