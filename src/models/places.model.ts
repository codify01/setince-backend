import mongoose from 'mongoose';

export interface Place {
	name: string;
	description: string;
	category?: string;
	tags?: string[];
	images: string[];
	location: {
		latitude: string;
		longitude: string;
	};
	address: string;
	contactInfo: {
		phone: string;
		email: string;
		website: string;
	};
	openingHours?: string;
	entryFee?: string;
	facilities?: string[];
	uniqueFeatures?: string[];
	bestTimeToVisit?: string;
	accessibility?: {
		gettingThere: string;
	};
	ownership?: string;
	ratings?: {
		averageRating: number;
		numberOfRatings: number;
	};
	approved?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const placeSchema = new mongoose.Schema<Place>({
	name: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: String },
	images: { type: [String], required: true },
	tags: { type: [String] },
	location: {
		latitude: { type: String},
		longitude: { type: String },
	},
	address: { type: String, required: true },
	contactInfo: {
		phone: { type: String, required: true },
		email: { type: String, required: true },
		website: { type: String },
	},
	openingHours: { type: String },
	entryFee: { type: String },
	facilities: { type: [String] },
	uniqueFeatures: { type: [String] },
	bestTimeToVisit: { type: String },
	accessibility: {
		gettingThere: { type: String },
	},
	ownership: { type: String },
	ratings: {
		averageRating: { type: Number, default: 0 },
		numberOfRatings: { type: Number, default: 0 },
	},
	approved: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

placeSchema.index({ name: 1 });
placeSchema.index({ address: 1 });

const PlacesModel = mongoose.model<Place>('Places', placeSchema);

export default PlacesModel;
