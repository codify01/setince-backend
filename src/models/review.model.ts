import mongoose from 'mongoose';

export interface Review {
  _id?: mongoose.Types.ObjectId;
  place: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new mongoose.Schema<Review>(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Places', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

reviewSchema.index({ place: 1, createdAt: -1 });
reviewSchema.index({ user: 1, place: 1 }, { unique: true });

const ReviewModel = mongoose.model<Review>('Review', reviewSchema);

export default ReviewModel;
