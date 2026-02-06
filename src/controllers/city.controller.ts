import CityModel from '../models/city.model';
import { sendError, sendSuccess } from '../helpers/responseHelper';

export const listCities = async (_req, res) => {
  try {
    const cities = await CityModel.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 'Cities fetched successfully', cities);
  } catch (error: any) {
    console.error('Error fetching cities:', error);
    return sendError(res, 'Server error while fetching cities', 500, error?.message);
  }
};

export const createCity = async (req, res) => {
  try {
    const { name, country, state, latitude, longitude, timezone, isActive } = req.body;
    if (!name) {
      return sendError(res, 'City name is required', 400);
    }

    const city = await CityModel.create({
      name,
      country,
      state,
      latitude,
      longitude,
      timezone,
      isActive,
    });

    return sendSuccess(res, 'City created successfully', city, 201);
  } catch (error: any) {
    console.error('Error creating city:', error);
    return sendError(res, 'Server error while creating city', 500, error?.message);
  }
};
