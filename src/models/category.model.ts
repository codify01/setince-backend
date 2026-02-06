import mongoose from 'mongoose';

export interface Category {
  _id?: mongoose.Types.ObjectId;
  title: string;
  value: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new mongoose.Schema<Category>({
  title: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true, lowercase: true, unique: true },
  image: { type: String },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

categorySchema.index({ title: 1 });
categorySchema.index({ value: 1 }, { unique: true });

const CategoryModel = mongoose.model<Category>('Category', categorySchema);

export default CategoryModel;
