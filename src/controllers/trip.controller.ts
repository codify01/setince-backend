import TripModel from '../models/trip.model';
import CityModel from '../models/city.model';
import { generateItinerary } from '../services/itineraryGenerator.service';
import { sendError, sendSuccess } from '../helpers/responseHelper';

export const createTrip = async (req, res) => {
  try {
    const {
      title,
      description,
      cities,
      startDate,
      endDate,
      preferences,
      selectedPlaces,
    } = req.body;

    if (!title || !startDate || !endDate || !Array.isArray(cities) || cities.length === 0) {
      return sendError(res, 'title, dates, and cities are required', 400);
    }

    const cityIds = cities.map((c) => c.cityId || c._id).filter(Boolean);
    const cityDocs = await CityModel.find({ _id: { $in: cityIds } }).select('name');

    const normalizedCities = cities.map((city) => {
      const id = city.cityId || city._id;
      const found = cityDocs.find((doc) => String(doc._id) === String(id));
      return {
        city: id,
        name: city.name || found?.name || '',
      };
    });

    const trip = await TripModel.create({
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

    const itinerary = await generateItinerary({
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

    return sendSuccess(res, 'Trip created successfully', trip, 201);
  } catch (error: any) {
    console.error('Error creating trip:', error);
    return sendError(res, 'Server error while creating trip', 500, error?.message);
  }
};

export const getTrips = async (req, res) => {
  try {
    const trips = await TripModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Trips fetched successfully', trips);
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    return sendError(res, 'Server error while fetching trips', 500, error?.message);
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await TripModel.findOne({ _id: id, user: req.user._id });
    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }
    return sendSuccess(res, 'Trip fetched successfully', trip);
  } catch (error: any) {
    console.error('Error fetching trip:', error);
    return sendError(res, 'Server error while fetching trip', 500, error?.message);
  }
};

export const getAllTrips = async (req, res) => {
  try {
    const trips = await TripModel.find();
    return sendSuccess(res, 'Trips fetched successfully', trips);
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    return sendError(res, 'Server error while fetching trips', 500, error?.message);
  }
}
