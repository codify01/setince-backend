import { createPlace, getAllPlaces, getPlaceById } from '../services/placeServices';
import { sendError, sendSuccess } from '../helpers/responseHelper';
import { Place } from '../models/places.model';

export const addPlace = async (req, res) => {
	try {
		const {
			name,
			description,
			category,
			images,
			address,
			latitude,
			longitude,
			tags,
			openingHours,
			entryFee,
			bestTimeToVisit,
			facilities,
			uniqueFeatures,
			accessibility,
            email,
			location,
			contactInfo,
            phone,
            website,
            ownership,
		} = req.body;

		// Validation
		if (!name || !description || !address) {
			return sendError(res, 'Missing required fields', 400);
		}

		const placeData: Place = {
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
			ownership		};

		const newPlace = await createPlace(placeData);

		if (!newPlace) {
			return sendError(res, 'Place creation failed', 400);
		}

		return sendSuccess(res, 'Place created successfully', newPlace, 201);
	} catch (error: any) {
		console.error('Error creating place:', error);
		return sendError(res, 'Server error while creating place', 500, error.message);
	}
};

export const fetchPlaceById = async (req, res) => {
    try {
        const placeId = req.params.id;
        if (!placeId) {
            return sendError(res, 'Place ID is required', 400);
        }

        const place = await getPlaceById(placeId);
        if (!place) {
            return sendError(res, 'Place not found', 404);
        }

        return sendSuccess(res, 'Place fetched successfully', place);
    } catch (error: any) {
        console.error('Error fetching place:', error);
        return sendError(res, 'Server error while fetching place', 500, error.message);
    }
};

export const fetchAllPlaces = async (req, res) => {
    try {
        const places = await getAllPlaces()

        if (!places || places.length === 0) {
            return sendError(res, 'No places found', 404);
        }

        return sendSuccess(res, 'Places fetched successfully', places);
    } catch (error: any) {
        console.error('Error fetching places:', error);
        return sendError(res, 'Server error while fetching places', 500, error.message);
    }
};

export const updatePlace = async (req, res) => {
    // Implementation for updating a place
	
};

export const deletePlace = async (req, res) => {
    // Implementation for deleting a place
};

export const searchPlaces = async (req, res) => {
    // Implementation for searching places
};

export const getPlacesByCategory = async (req, res) => {
    // Implementation for getting places by category
};

export const getPlacesByLocation = async (req, res) => {
    // Implementation for getting places by location
};

export const getPlacesByTag = async (req, res) => {
    // Implementation for getting places by tag
};

export const getPlacesByOwner = async (req, res) => {
    // Implementation for getting places by owner
};

export const getPopularPlaces = async (req, res) => {
    // Implementation for getting popular places
};

export const getRecentPlaces = async (req, res) => {
    // Implementation for getting recent places
};

