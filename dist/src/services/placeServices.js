"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlaceById = exports.updatePlaceById = exports.autocompletePlaces = exports.getAllPlaces = exports.getPlaceById = exports.createPlacesBulk = exports.createPlace = void 0;
const places_model_1 = __importDefault(require("../models/places.model"));
const createPlace = async (placeData) => {
    try {
        const place = new places_model_1.default(placeData);
        await place.save();
        return place;
    }
    catch (error) {
        console.error("Error creating place:", error);
        throw new Error(error);
    }
};
exports.createPlace = createPlace;
const createPlacesBulk = async (placesData) => {
    try {
        const places = await places_model_1.default.insertMany(placesData);
        return places;
    }
    catch (error) {
        console.error("Error creating places in bulk:", error);
        throw new Error("Bulk place creation failed");
    }
};
exports.createPlacesBulk = createPlacesBulk;
const getPlaceById = async (placeId) => {
    try {
        const place = await places_model_1.default.findById(placeId);
        if (!place) {
            throw new Error("Place not found");
        }
        return place;
    }
    catch (error) {
        console.error("Error fetching place:", error);
        throw new Error("Place fetch failed");
    }
};
exports.getPlaceById = getPlaceById;
const getAllPlaces = async () => {
    try {
        const places = await places_model_1.default.find();
        return places;
    }
    catch (error) {
        console.error("Error fetching places:", error);
        throw new Error("Places fetch failed");
    }
};
exports.getAllPlaces = getAllPlaces;
const autocompletePlaces = async (query, limit = 10) => {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const places = await places_model_1.default.find({
            approved: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { address: { $regex: query, $options: 'i' } },
            ],
        })
            .select('name address images category')
            .limit(limit);
        return places;
    }
    catch (error) {
        console.error('Autocomplete search failed:', error);
        throw new Error('Autocomplete search failed');
    }
};
exports.autocompletePlaces = autocompletePlaces;
const updatePlaceById = async (placeId, updateData) => {
    try {
        const place = await places_model_1.default.findByIdAndUpdate(placeId, updateData, { new: true });
        if (!place) {
            throw new Error("Place not found");
        }
        return place;
    }
    catch (error) {
        console.error("Error updating place:", error);
        throw new Error("Place update failed");
    }
};
exports.updatePlaceById = updatePlaceById;
const deletePlaceById = async (placeId) => {
    try {
        const place = await places_model_1.default.findByIdAndDelete(placeId);
        if (!place) {
            throw new Error("Place not found");
        }
        return place;
    }
    catch (error) {
        console.error("Error deleting place:", error);
        throw new Error("Place deletion failed");
    }
};
exports.deletePlaceById = deletePlaceById;
