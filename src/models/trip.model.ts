import mongoose from "mongoose";


export interface Trip {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  price?: number;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const tripSchema = new mongoose.Schema<Trip>({
  title: { type: String, required: true },
  description: { type: String },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TripModel = mongoose.model<Trip>("Trip", tripSchema);

export default TripModel;

