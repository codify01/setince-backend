import { autocompletePlaces, createPlace, createPlacesBulk, deletePlaceById, getAllPlaces, getPlaceById, updatePlaceById } from '../services/placeServices';
import { sendError, sendSuccess } from '../helpers/responseHelper';
import { Place } from '../models/places.model';

export const addPlace = async (req, res) => {
	try {
		const {
			name,
			description,
			category,
			categoryId,
			city,
			cityId,
			images,
			address,
			latitude,
			longitude,
			tags,
			openingHours,
			openingHoursWeekly,
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
			categoryId,
			city,
			cityId,
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
			openingHoursWeekly,
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

export const addPlacesBulk = async (req, res) => {
	try {
		const placesData: Place[] = req.body;
		if (!Array.isArray(placesData) || placesData.length === 0) {
			return sendError(res, 'Invalid input data. Expected a non-empty array of places.', 400);
		}

		const newPlaces = await createPlacesBulk(placesData);

		if (!newPlaces || newPlaces.length === 0) {
			return sendError(res, 'Bulk place creation failed', 400);
		}

		return sendSuccess(res, 'Places created successfully', newPlaces, 201);
	} catch (error: any) {
		console.error('Error creating places in bulk:', error);
		return sendError(res, 'Server error while creating places in bulk', 500, error.message);
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
	try{
		const placeId = req.params.id;
		if(!placeId){
			return sendError(res, 'Place ID is required', 400);
		}

		const updateData = req.body;
		if(Object.keys(updateData).length === 0){
			return sendError(res, 'No data provided for update', 400);
		}

		// Assuming a updatePlaceById service function exists
		const updatedPlace = await updatePlaceById(placeId, updateData);
		if(!updatedPlace){
			return sendError(res, 'Place not found or update failed', 404);
		}

		return sendSuccess(res, 'Place updated successfully', updatedPlace);	
	}catch(error: any){
		console.error('Error updating place:', error);
		return sendError(res, 'Server error while updating place', 500, error.message);
	}	
	
};

export const deletePlace = async (req, res) => {
    // Implementation for deleting a place
	try{
		const placeId = req.params.id;
		if(!placeId){
			return sendError(res, 'Place ID is required', 400);
		}

		// Assuming a deletePlaceById service function exists
		const deletedPlace = await deletePlaceById(placeId);
		if(!deletedPlace){
			return sendError(res, 'Place not found or already deleted', 404);
		}

		return sendSuccess(res, 'Place deleted successfully', deletedPlace);	
	}catch(error: any){
		console.error('Error deleting place:', error);
		return sendError(res, 'Server error while deleting place', 500, error.message);
	}
};

export const searchPlaces = async (req, res) => {
  try {
    const query = String(
      req.query.query ?? req.query.q ?? req.query.search ?? ''
    ).trim();
    const approvedOnly = String(req.query.approved ?? '').toLowerCase() === 'true';

    if (query.length < 2) {
      return sendSuccess(res, 'Type to search places', []);
    }

    const results = await autocompletePlaces(query, 10, approvedOnly || undefined);

    return sendSuccess(
      res,
      results.length ? 'Places found successfully' : 'No suggestions yet',
      results
    );
  } catch (error: any) {
    console.error('Error searching places:', error);
    return sendError(
      res,
      'Server error while searching places',
      500,
      error?.message
    );
  }
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
