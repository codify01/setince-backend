"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentPlaces = exports.getPopularPlaces = exports.getPlacesByOwner = exports.getPlacesByTag = exports.getPlacesByLocation = exports.getPlacesByCategory = exports.searchPlaces = exports.deletePlace = exports.updatePlace = exports.fetchAllPlaces = exports.fetchPlaceById = exports.addPlacesBulk = exports.addPlace = void 0;
const placeServices_1 = require("../services/placeServices");
const responseHelper_1 = require("../helpers/responseHelper");
const addPlace = async (req, res) => {
    try {
        const { name, description, category, images, address, latitude, longitude, tags, openingHours, entryFee, bestTimeToVisit, facilities, uniqueFeatures, accessibility, email, location, contactInfo, phone, website, ownership, } = req.body;
        // Validation
        if (!name || !description || !address) {
            return (0, responseHelper_1.sendError)(res, 'Missing required fields', 400);
        }
        const placeData = {
            name,
            description,
            category,
            tags,
            images,
            address,
            // location: {
            // 	latitude,
            // 	longitude,
            // },
            location,
            // contactInfo: {
            // 	email,
            // 	phone,
            // 	website,
            // },
            contactInfo,
            openingHours,
            entryFee,
            bestTimeToVisit,
            facilities,
            uniqueFeatures,
            accessibility,
            ownership
        };
        const newPlace = await (0, placeServices_1.createPlace)(placeData);
        if (!newPlace) {
            return (0, responseHelper_1.sendError)(res, 'Place creation failed', 400);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Place created successfully', newPlace, 201);
    }
    catch (error) {
        console.error('Error creating place:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating place', 500, error.message);
    }
};
exports.addPlace = addPlace;
const addPlacesBulk = async (req, res) => {
    try {
        const placesData = req.body;
        if (!Array.isArray(placesData) || placesData.length === 0) {
            return (0, responseHelper_1.sendError)(res, 'Invalid input data. Expected a non-empty array of places.', 400);
        }
        const newPlaces = await (0, placeServices_1.createPlacesBulk)(placesData);
        if (!newPlaces || newPlaces.length === 0) {
            return (0, responseHelper_1.sendError)(res, 'Bulk place creation failed', 400);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Places created successfully', newPlaces, 201);
    }
    catch (error) {
        console.error('Error creating places in bulk:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating places in bulk', 500, error.message);
    }
};
exports.addPlacesBulk = addPlacesBulk;
const fetchPlaceById = async (req, res) => {
    try {
        const placeId = req.params.id;
        if (!placeId) {
            return (0, responseHelper_1.sendError)(res, 'Place ID is required', 400);
        }
        const place = await (0, placeServices_1.getPlaceById)(placeId);
        if (!place) {
            return (0, responseHelper_1.sendError)(res, 'Place not found', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Place fetched successfully', place);
    }
    catch (error) {
        console.error('Error fetching place:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching place', 500, error.message);
    }
};
exports.fetchPlaceById = fetchPlaceById;
const fetchAllPlaces = async (req, res) => {
    try {
        const places = await (0, placeServices_1.getAllPlaces)();
        if (!places || places.length === 0) {
            return (0, responseHelper_1.sendError)(res, 'No places found', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Places fetched successfully', places);
    }
    catch (error) {
        console.error('Error fetching places:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching places', 500, error.message);
    }
};
exports.fetchAllPlaces = fetchAllPlaces;
const updatePlace = async (req, res) => {
    // Implementation for updating a place
    try {
        const placeId = req.params.id;
        if (!placeId) {
            return (0, responseHelper_1.sendError)(res, 'Place ID is required', 400);
        }
        const updateData = req.body;
        if (Object.keys(updateData).length === 0) {
            return (0, responseHelper_1.sendError)(res, 'No data provided for update', 400);
        }
        // Assuming a updatePlaceById service function exists
        const updatedPlace = await (0, placeServices_1.updatePlaceById)(placeId, updateData);
        if (!updatedPlace) {
            return (0, responseHelper_1.sendError)(res, 'Place not found or update failed', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Place updated successfully', updatedPlace);
    }
    catch (error) {
        console.error('Error updating place:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while updating place', 500, error.message);
    }
};
exports.updatePlace = updatePlace;
const deletePlace = async (req, res) => {
    // Implementation for deleting a place
    try {
        const placeId = req.params.id;
        if (!placeId) {
            return (0, responseHelper_1.sendError)(res, 'Place ID is required', 400);
        }
        // Assuming a deletePlaceById service function exists
        const deletedPlace = await (0, placeServices_1.deletePlaceById)(placeId);
        if (!deletedPlace) {
            return (0, responseHelper_1.sendError)(res, 'Place not found or already deleted', 404);
        }
        return (0, responseHelper_1.sendSuccess)(res, 'Place deleted successfully', deletedPlace);
    }
    catch (error) {
        console.error('Error deleting place:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while deleting place', 500, error.message);
    }
};
exports.deletePlace = deletePlace;
const searchPlaces = async (req, res) => {
    try {
        const query = String(req.query.query || '').trim();
        if (query.length < 2) {
            return (0, responseHelper_1.sendSuccess)(res, 'Type to search places', []);
        }
        const results = await (0, placeServices_1.autocompletePlaces)(query, 10);
        return (0, responseHelper_1.sendSuccess)(res, results.length ? 'Places found successfully' : 'No suggestions yet', results);
    }
    catch (error) {
        console.error('Error searching places:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while searching places', 500, error?.message);
    }
};
exports.searchPlaces = searchPlaces;
const getPlacesByCategory = async (req, res) => {
    // Implementation for getting places by category
};
exports.getPlacesByCategory = getPlacesByCategory;
const getPlacesByLocation = async (req, res) => {
    // Implementation for getting places by location
};
exports.getPlacesByLocation = getPlacesByLocation;
const getPlacesByTag = async (req, res) => {
    // Implementation for getting places by tag
};
exports.getPlacesByTag = getPlacesByTag;
const getPlacesByOwner = async (req, res) => {
    // Implementation for getting places by owner
};
exports.getPlacesByOwner = getPlacesByOwner;
const getPopularPlaces = async (req, res) => {
    // Implementation for getting popular places
};
exports.getPopularPlaces = getPopularPlaces;
const getRecentPlaces = async (req, res) => {
    // Implementation for getting recent places
};
exports.getRecentPlaces = getRecentPlaces;
