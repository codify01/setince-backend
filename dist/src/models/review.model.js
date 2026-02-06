"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    place: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Places', required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    images: { type: [String], default: [] },
}, { timestamps: true });
reviewSchema.index({ place: 1, createdAt: -1 });
reviewSchema.index({ user: 1, place: 1 }, { unique: true });
const ReviewModel = mongoose_1.default.model('Review', reviewSchema);
exports.default = ReviewModel;
