import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItinerary extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  places: {
    place: mongoose.Types.ObjectId;
    day: number; // day of the trip (1 = Day 1, etc.)
    visited: boolean;
  }[];
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  durationDays?: number;
  progress?: {
    visited: number;
    total: number;
  };
}

const ItinerarySchema = new Schema<IItinerary>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    places: [
      {
        place: { type: Schema.Types.ObjectId, ref: "Places", required: true },
        day: { type: Number, required: false },
        visited: { type: Boolean, default: false },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtuals
 */

// Duration in days
ItinerarySchema.virtual("durationDays").get(function (this: IItinerary) {
  if (!this.startDate || !this.endDate) return 0;
  const diff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Progress tracking
ItinerarySchema.virtual("progress").get(function (this: IItinerary) {
  const total = this.places.length;
  const visited = this.places.filter((p) => p.visited).length;
  return { visited, total };
});

 // Middleware: auto-populate

function autoPopulate(next: any) {
  this.populate("user", "name email");
  this.populate("places.place", "name address category");
  next();
}

ItinerarySchema.pre("find", autoPopulate);
ItinerarySchema.pre("findOne", autoPopulate);
// ItinerarySchema.pre("findById", autoPopulate);

const ItineraryModel: Model<IItinerary> =
  mongoose.models.Itinerary || mongoose.model<IItinerary>("Itinerary", ItinerarySchema);

export default ItineraryModel;
