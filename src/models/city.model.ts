import mongoose from 'mongoose';

export interface City {
  _id?: mongoose.Types.ObjectId;
  name: string;
  country?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const citySchema = new mongoose.Schema<City>(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String },
    state: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

citySchema.index({ name: 1, country: 1 });

const CityModel = mongoose.model<City>('City', citySchema);

export default CityModel;
