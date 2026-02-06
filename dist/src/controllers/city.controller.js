"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCity = exports.listCities = void 0;
const city_model_1 = __importDefault(require("../models/city.model"));
const responseHelper_1 = require("../helpers/responseHelper");
const listCities = async (_req, res) => {
    try {
        const cities = await city_model_1.default.find({ isActive: true }).sort({ name: 1 });
        return (0, responseHelper_1.sendSuccess)(res, 'Cities fetched successfully', cities);
    }
    catch (error) {
        console.error('Error fetching cities:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while fetching cities', 500, error?.message);
    }
};
exports.listCities = listCities;
const createCity = async (req, res) => {
    try {
        const { name, country, state, latitude, longitude, timezone, isActive } = req.body;
        if (!name) {
            return (0, responseHelper_1.sendError)(res, 'City name is required', 400);
        }
        const city = await city_model_1.default.create({
            name,
            country,
            state,
            latitude,
            longitude,
            timezone,
            isActive,
        });
        return (0, responseHelper_1.sendSuccess)(res, 'City created successfully', city, 201);
    }
    catch (error) {
        console.error('Error creating city:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating city', 500, error?.message);
    }
};
exports.createCity = createCity;
