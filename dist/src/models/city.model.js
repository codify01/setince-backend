"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const citySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    country: { type: String },
    state: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
citySchema.index({ name: 1, country: 1 });
const CityModel = mongoose_1.default.model('City', citySchema);
exports.default = CityModel;
