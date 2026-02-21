"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTrips = exports.clearTripsAndItineraries = exports.updateTrip = exports.getTripById = exports.getTrips = exports.createTrip = void 0;
const trip_model_1 = __importDefault(require("../models/trip.model"));
const itinerary_model_1 = __importDefault(require("../models/itinerary.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const responseHelper_1 = require("../helpers/responseHelper");
const createTrip = async (req, res) => {
    try {
        const { title, description, travelers, image, cities, startDate, endDate, preferences, selectedPlaces, } = req.body;
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
            travelers,
            image,
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
        const trips = await trip_model_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('itinerary.days.blocks.place', 'name category ratings images');
        const formattedTrips = trips.map((trip) => formatTripDetail(trip));
        return (0, responseHelper_1.sendSuccess)(res, 'Trips fetched successfully', formattedTrips);
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
        const trip = await trip_model_1.default.findOne({ _id: id, user: req.user._id }).populate('itinerary.days.blocks.place', 'name category ratings images');
        if (!trip) {
            return (0, responseHelper_1.sendError)(res, 'Trip not found', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Trip fetched successfully', formatTripDetail(trip));
    }
    catch (error) {
        console.error('Error fetching trip:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching trip', 500, error?.message);
    }
};
exports.getTripById = getTripById;
const normalizeCities = async (cities) => {
    if (!Array.isArray(cities) || cities.length === 0)
        return [];
    const cityIds = cities.map((c) => c.cityId || c._id).filter(Boolean);
    const cityDocs = await city_model_1.default.find({ _id: { $in: cityIds } }).select('name');
    return cities.map((city) => {
        const id = city.cityId || city._id;
        const found = cityDocs.find((doc) => String(doc._id) === String(id));
        return {
            city: id,
            name: city.name || found?.name || '',
        };
    });
};
const normalizeItinerary = (itinerary) => {
    if (!itinerary || !Array.isArray(itinerary.days))
        return itinerary;
    return {
        ...itinerary,
        days: itinerary.days.map((day) => ({
            ...day,
            blocks: Array.isArray(day.blocks)
                ? day.blocks.map((block) => ({
                    ...block,
                    completed: typeof block.completed === 'boolean'
                        ? block.completed
                        : typeof block.done === 'boolean'
                            ? block.done
                            : false,
                }))
                : [],
        })),
    };
};
const formatPlaceSummary = (place) => {
    if (!place || typeof place !== 'object')
        return place;
    return {
        _id: place._id,
        name: place.name,
        category: place.category,
        rating: place.ratings?.averageRating ?? 0,
        images: place.images || [],
    };
};
const formatTripDetail = (trip) => {
    const obj = typeof trip.toObject === 'function' ? trip.toObject() : trip;
    if (!obj?.itinerary?.days)
        return obj;
    return {
        ...obj,
        itinerary: {
            ...obj.itinerary,
            days: obj.itinerary.days.map((day) => ({
                ...day,
                blocks: Array.isArray(day.blocks)
                    ? day.blocks.map((block) => ({
                        ...block,
                        completed: typeof block.completed === 'boolean'
                            ? block.completed
                            : typeof block.done === 'boolean'
                                ? block.done
                                : false,
                        place: formatPlaceSummary(block.place),
                    }))
                    : [],
            })),
        },
    };
};
const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, travelers, image, cities, startDate, endDate, preferences, selectedPlaces, itinerary, status, } = req.body;
        const trip = await trip_model_1.default.findOne({ _id: id, user: req.user._id });
        if (!trip) {
            return (0, responseHelper_1.sendError)(res, 'Trip not found', 404);
        }
        if (typeof title !== 'undefined')
            trip.title = title;
        if (typeof description !== 'undefined')
            trip.description = description;
        if (typeof travelers !== 'undefined')
            trip.travelers = travelers;
        if (typeof image !== 'undefined')
            trip.image = image;
        if (typeof startDate !== 'undefined')
            trip.startDate = startDate;
        if (typeof endDate !== 'undefined')
            trip.endDate = endDate;
        if (typeof selectedPlaces !== 'undefined')
            trip.selectedPlaces = selectedPlaces;
        if (typeof status !== 'undefined')
            trip.status = status;
        if (typeof cities !== 'undefined') {
            const normalizedCities = await normalizeCities(cities);
            if (normalizedCities.length === 0) {
                return (0, responseHelper_1.sendError)(res, 'cities must be a non-empty array', 400);
            }
            trip.cities = normalizedCities;
        }
        if (typeof preferences !== 'undefined') {
            trip.preferences = {
                pace: preferences?.pace ?? trip.preferences?.pace ?? 'normal',
                interests: preferences?.interests ?? trip.preferences?.interests ?? [],
                allowSameDayCityTravel: preferences?.allowSameDayCityTravel ??
                    trip.preferences?.allowSameDayCityTravel ??
                    false,
                preferredStartHour: preferences?.preferredStartHour ?? trip.preferences?.preferredStartHour ?? 9,
                preferredEndHour: preferences?.preferredEndHour ?? trip.preferences?.preferredEndHour ?? 18,
            };
        }
        if (typeof itinerary !== 'undefined') {
            trip.itinerary = normalizeItinerary(itinerary);
        }
        await trip.save();
        return (0, responseHelper_1.sendSuccess)(res, 'Trip updated successfully', trip);
    }
    catch (error) {
        console.error('Error updating trip:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while updating trip', 500, error?.message);
    }
};
exports.updateTrip = updateTrip;
const clearTripsAndItineraries = async (req, res) => {
    try {
        const tripResult = await trip_model_1.default.deleteMany({});
        const itineraryResult = await itinerary_model_1.default.deleteMany({});
        return (0, responseHelper_1.sendSuccess)(res, 'Trips and itineraries cleared', {
            tripsDeleted: tripResult.deletedCount ?? 0,
            itinerariesDeleted: itineraryResult.deletedCount ?? 0,
        });
    }
    catch (error) {
        console.error('Error clearing trips and itineraries:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while clearing trips and itineraries', 500, error?.message);
    }
};
exports.clearTripsAndItineraries = clearTripsAndItineraries;
const getAllTrips = async (req, res) => {
    try {
        const trips = await trip_model_1.default.find();
        return (0, responseHelper_1.sendSuccess)(res, 'Trips fetched successfully', trips);
    }
    catch (error) {
        console.error('Error fetching trips:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching trips', 500, error?.message);
    }
};
exports.getAllTrips = getAllTrips;
