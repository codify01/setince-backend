"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripById = exports.getTrips = exports.createTrip = void 0;
const trip_model_1 = __importDefault(require("../models/trip.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const itineraryGenerator_service_1 = require("../services/itineraryGenerator.service");
const responseHelper_1 = require("../helpers/responseHelper");
const createTrip = async (req, res) => {
    try {
        const { title, description, cities, startDate, endDate, preferences, selectedPlaces, } = req.body;
        if (!title || !startDate || !endDate || !Array.isArray(cities) || cities.length === 0) {
            return (0, responseHelper_1.sendError)(res, 'title, dates, and cities are required', 400);
        }
        const cityIds = cities.map((c) => c.cityId || c._id).filter(Boolean);
        const cityDocs = await city_model_1.default.find({ _id: { $in: cityIds } }).select('name');
        const normalizedCities = cities.map((city) => {
            const id = city.cityId || city._id;
            const found = cityDocs.find((doc) => String(doc._id) === String(id));
            return {
                city: id,
                name: city.name || found?.name || '',
            };
        });
        const trip = await trip_model_1.default.create({
            user: req.user._id,
            title,
            description,
            cities: normalizedCities,
            startDate,
            endDate,
            preferences: {
                pace: preferences?.pace || 'normal',
                interests: preferences?.interests || [],
                allowSameDayCityTravel: preferences?.allowSameDayCityTravel || false,
                preferredStartHour: preferences?.preferredStartHour ?? 9,
                preferredEndHour: preferences?.preferredEndHour ?? 18,
            },
            selectedPlaces: selectedPlaces || [],
            status: 'draft',
        });
        const itinerary = await (0, itineraryGenerator_service_1.generateItinerary)({
            startDate: trip.startDate,
            endDate: trip.endDate,
            cities: normalizedCities.map((c) => ({ cityId: String(c.city), name: c.name })),
            pace: trip.preferences.pace,
            interests: trip.preferences.interests,
            allowSameDayCityTravel: trip.preferences.allowSameDayCityTravel,
            preferredStartHour: trip.preferences.preferredStartHour,
            preferredEndHour: trip.preferences.preferredEndHour,
            selectedPlaceIds: selectedPlaces || [],
        });
        trip.itinerary = itinerary;
        trip.status = 'generated';
        await trip.save();
        return (0, responseHelper_1.sendSuccess)(res, 'Trip created successfully', trip, 201);
    }
    catch (error) {
        console.error('Error creating trip:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating trip', 500, error?.message);
    }
};
exports.createTrip = createTrip;
const getTrips = async (req, res) => {
    try {
        const trips = await trip_model_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        return (0, responseHelper_1.sendSuccess)(res, 'Trips fetched successfully', trips);
    }
    catch (error) {
        console.error('Error fetching trips:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching trips', 500, error?.message);
    }
};
exports.getTrips = getTrips;
const getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await trip_model_1.default.findOne({ _id: id, user: req.user._id });
        if (!trip) {
            return (0, responseHelper_1.sendError)(res, 'Trip not found', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Trip fetched successfully', trip);
    }
    catch (error) {
        console.error('Error fetching trip:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching trip', 500, error?.message);
    }
};
exports.getTripById = getTripById;
