"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePlaceVisited = exports.deleteItinerary = exports.updateItinerary = exports.getItineraryById = exports.getItineraries = exports.createItinerary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const itinerary_model_1 = __importDefault(require("../models/itinerary.model"));
// Create itinerary
const createItinerary = async (req, res) => {
    try {
        const { title, description, places, startDate, endDate, notes } = req.body;
        if (!title || !startDate || !endDate) {
            return res.status(400).json({ message: "Title, startDate, and endDate are required." });
        }
        const formattedPlaces = places.map((id) => ({ place: new mongoose_1.default.Types.ObjectId(id) }));
        const itinerary = await itinerary_model_1.default.create({
            user: req.user._id,
            title,
            description,
            places: formattedPlaces,
            startDate,
            endDate,
            notes,
        });
        res.status(201).json({ success: true, data: itinerary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createItinerary = createItinerary;
// Get all itineraries (for logged-in user)
const getItineraries = async (req, res) => {
    try {
        const itineraries = await itinerary_model_1.default.find({ user: req.user._id });
        res.status(200).json({ success: true, data: itineraries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getItineraries = getItineraries;
// Get a single itinerary by ID
const getItineraryById = async (req, res) => {
    try {
        const itinerary = await itinerary_model_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!itinerary) {
            return res.status(404).json({ message: "Itinerary not found" });
        }
        res.status(200).json({ success: true, data: itinerary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getItineraryById = getItineraryById;
// Update itinerary
const updateItinerary = async (req, res) => {
    try {
        const { title, description, places, startDate, endDate, notes } = req.body;
        const itinerary = await itinerary_model_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { title, description, places, startDate, endDate, notes }, { new: true, runValidators: true });
        if (!itinerary) {
            return res.status(404).json({ message: "Itinerary not found" });
        }
        res.status(200).json({ success: true, data: itinerary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateItinerary = updateItinerary;
// Delete itinerary
const deleteItinerary = async (req, res) => {
    try {
        const itinerary = await itinerary_model_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!itinerary) {
            return res.status(404).json({ message: "Itinerary not found" });
        }
        res.status(200).json({ success: true, message: "Itinerary deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteItinerary = deleteItinerary;
// Mark place as visited / unvisited inside an itinerary
const togglePlaceVisited = async (req, res) => {
    try {
        const { itineraryId, placeId } = req.params;
        const itinerary = await itinerary_model_1.default.findOne({
            _id: itineraryId,
            user: req.user._id,
        });
        if (!itinerary) {
            return res.status(404).json({ message: "Itinerary not found" });
        }
        const place = itinerary.places.find((p) => p.place.toString() === placeId);
        if (!place) {
            return res.status(404).json({ message: "Place not found in itinerary" });
        }
        place.visited = !place.visited;
        await itinerary.save();
        res.status(200).json({ success: true, data: itinerary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.togglePlaceVisited = togglePlaceVisited;
