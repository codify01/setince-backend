"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tripSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    cities: [
        {
            city: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'City', required: true },
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
    selectedPlaces: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Places' }],
    itinerary: {
        days: [
            {
                dayNumber: { type: Number },
                date: { type: Date },
                city: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'City' },
                cityName: { type: String },
                blocks: [
                    {
                        type: { type: String },
                        title: { type: String },
                        place: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Places' },
                        startTime: { type: String },
                        endTime: { type: String },
                        city: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'City' },
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
}, { timestamps: true });
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ 'cities.city': 1 });
const TripModel = mongoose_1.default.model('Trip', tripSchema);
exports.default = TripModel;
