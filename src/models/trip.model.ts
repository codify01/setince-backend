import mongoose from 'mongoose';

export type TripPace = 'relaxed' | 'normal' | 'packed';

export interface TripCity {
  city: mongoose.Types.ObjectId;
  name?: string;
}

export interface TripPreferences {
  pace: TripPace;
  interests?: string[];
  allowSameDayCityTravel?: boolean;
  preferredStartHour?: number;
  preferredEndHour?: number;
}

export interface ItineraryBlock {
  type: 'activity' | 'travel' | 'free_time' | 'meal' | 'rest';
  title: string;
  place?: mongoose.Types.ObjectId;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  city?: mongoose.Types.ObjectId;
  travelMinutes?: number;
  notes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: Date;
  city?: mongoose.Types.ObjectId;
  cityName?: string;
  blocks: ItineraryBlock[];
  summary?: {
    totalActivities: number;
    totalHours: number;
  };
}

export interface Trip {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  cities: TripCity[];
  startDate: Date;
  endDate: Date;
  preferences: TripPreferences;
  selectedPlaces?: mongoose.Types.ObjectId[];
  itinerary?: {
    days: ItineraryDay[];
    stats?: {
      totalDays: number;
      totalActivities: number;
    };
    warnings?: string[];
  };
  status?: 'draft' | 'generated';
  createdAt?: Date;
  updatedAt?: Date;
}

const tripSchema = new mongoose.Schema<Trip>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    cities: [
      {
        city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    preferences: {
      pace: { type: String, enum: ['relaxed', 'normal', 'packed'], default: 'normal' },
      interests: { type: [String], default: [] },
      allowSameDayCityTravel: { type: Boolean, default: false },
      preferredStartHour: { type: Number, default: 9 },
      preferredEndHour: { type: Number, default: 18 },
    },
    selectedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Places' }],
    itinerary: {
      days: [
        {
          dayNumber: { type: Number },
          date: { type: Date },
          city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
          cityName: { type: String },
          blocks: [
            {
              type: { type: String },
              title: { type: String },
              place: { type: mongoose.Schema.Types.ObjectId, ref: 'Places' },
              startTime: { type: String },
              endTime: { type: String },
              city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
              travelMinutes: { type: Number },
              notes: { type: String },
            },
          ],
          summary: {
            totalActivities: { type: Number },
            totalHours: { type: Number },
          },
        },
      ],
      stats: {
        totalDays: { type: Number },
        totalActivities: { type: Number },
      },
      warnings: { type: [String], default: [] },
    },
    status: { type: String, enum: ['draft', 'generated'], default: 'draft' },
  },
  { timestamps: true }
);

tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ 'cities.city': 1 });

const TripModel = mongoose.model<Trip>('Trip', tripSchema);

export default TripModel;
