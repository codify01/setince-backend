"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const placeSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    images: { type: [String], required: true },
    tags: { type: [String] },
    location: {
        latitude: { type: String },
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
const PlacesModel = mongoose_1.default.model('Places', placeSchema);
exports.default = PlacesModel;
