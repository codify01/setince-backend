"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTripFromPrompt = void 0;
const city_model_1 = __importDefault(require("../models/city.model"));
const trip_model_1 = __importDefault(require("../models/trip.model"));
const itineraryGenerator_service_1 = require("../services/itineraryGenerator.service");
const responseHelper_1 = require("../helpers/responseHelper");
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseJsonSafe = (text) => {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
};
const toDateString = (value) => {
    if (!value)
        return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return null;
    return date.toISOString().slice(0, 10);
};
const addDays = (dateStr, days) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime()))
        return null;
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};
const createTripFromPrompt = async (req, res) => {
    try {
        const { prompt } = req.body || {};
        if (!prompt || typeof prompt !== 'string') {
            return (0, responseHelper_1.sendError)(res, 'prompt is required', 400);
        }
        if (AI_PROVIDER === 'openai' && !OPENAI_API_KEY) {
            return (0, responseHelper_1.sendError)(res, 'OPENAI_API_KEY is not set', 500);
        }
        if (AI_PROVIDER === 'gemini' && !GEMINI_API_KEY) {
            return (0, responseHelper_1.sendError)(res, 'GEMINI_API_KEY is not set', 500);
        }
        const system = [
            'You are a travel planning assistant.',
            'Extract structured trip details from the user prompt.',
            'Output JSON only that matches the provided schema.',
            'If details are missing, include them in missing[].',
        ].join(' ');
        const schema = {
            type: 'object',
            additionalProperties: false,
            properties: {
                cities: {
                    type: 'array',
                    items: { type: 'string' },
                },
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                durationDays: { type: 'integer' },
                pace: { type: 'string', enum: ['relaxed', 'normal', 'packed'] },
                interests: {
                    type: 'array',
                    items: { type: 'string' },
                },
                travelers: { type: 'integer' },
                missing: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['cities', 'startDate', 'endDate', 'durationDays'],
                    },
                },
                title: { type: 'string' },
            },
            required: ['cities', 'missing'],
        };
        let content = '';
        if (AI_PROVIDER === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: OPENAI_MODEL,
                    temperature: 0.2,
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user', content: prompt },
                    ],
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'trip_intent',
                            strict: true,
                            schema,
                        },
                    },
                }),
            });
            if (!response.ok) {
                const text = await response.text();
                return (0, responseHelper_1.sendError)(res, `OpenAI error: ${text}`, 502);
            }
            const data = await response.json();
            content = data?.choices?.[0]?.message?.content || '';
        }
        else if (AI_PROVIDER === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`;
            const buildGeminiBody = (useSnakeCase) => {
                if (useSnakeCase) {
                    return {
                        system_instruction: {
                            parts: [{ text: system }],
                        },
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: prompt }],
                            },
                        ],
                        generation_config: {
                            temperature: 0.2,
                            response_mime_type: 'application/json',
                            response_json_schema: schema,
                        },
                    };
                }
                return {
                    systemInstruction: {
                        parts: [{ text: system }],
                    },
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json',
                        responseJsonSchema: schema,
                    },
                };
            };
            const runGeminiRequest = async (useSnakeCase) => fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY,
                },
                body: JSON.stringify(buildGeminiBody(useSnakeCase)),
            });
            let response = await runGeminiRequest(false);
            if (!response.ok) {
                const _ = await response.text();
                response = await runGeminiRequest(true);
            }
            if (!response.ok) {
                const text = await response.text();
                return (0, responseHelper_1.sendError)(res, `Gemini error: ${text}`, 502);
            }
            const data = await response.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            content = parts.map((part) => part?.text || '').join('');
        }
        else {
            return (0, responseHelper_1.sendError)(res, `Unsupported AI provider: ${AI_PROVIDER}`, 400);
        }
        const parsed = parseJsonSafe(content);
        if (!parsed) {
            return (0, responseHelper_1.sendError)(res, 'Failed to parse AI response', 502);
        }
        const { cities = [], startDate, endDate, durationDays, pace = 'normal', interests = [], travelers = 1, missing = [], title, } = parsed;
        let normalizedStart = toDateString(startDate);
        let normalizedEnd = toDateString(endDate);
        if (!normalizedStart && normalizedEnd && Number.isFinite(durationDays)) {
            normalizedStart = addDays(normalizedEnd, -Number(durationDays) + 1);
        }
        else if (normalizedStart && !normalizedEnd && Number.isFinite(durationDays)) {
            normalizedEnd = addDays(normalizedStart, Number(durationDays) - 1);
        }
        const missingFields = new Set(missing);
        if (!cities?.length)
            missingFields.add('cities');
        if (!normalizedStart)
            missingFields.add('startDate');
        if (!normalizedEnd)
            missingFields.add('endDate');
        if (missingFields.size > 0) {
            return res.status(422).json({
                success: false,
                message: 'Need more details to plan the trip',
                missing: Array.from(missingFields),
                importantFields: Array.from(missingFields),
            });
        }
        const cityNames = cities.map((c) => String(c).trim()).filter(Boolean);
        const cityDocs = await city_model_1.default.find({
            $or: cityNames.map((name) => ({
                name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
            })),
        }).select('name');
        if (cityDocs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cities not found in database',
                missing: ['cities'],
            });
        }
        const normalizedCities = cityDocs.map((city) => ({
            city: city._id,
            name: city.name,
        }));
        const trip = await trip_model_1.default.create({
            user: req.user._id,
            title: title || `${cityDocs[0].name} Trip`,
            description: prompt,
            cities: normalizedCities,
            startDate: normalizedStart,
            endDate: normalizedEnd,
            preferences: {
                pace,
                interests,
                allowSameDayCityTravel: false,
                preferredStartHour: 9,
                preferredEndHour: 18,
            },
            selectedPlaces: [],
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
            selectedPlaceIds: [],
        });
        trip.itinerary = itinerary;
        trip.status = 'generated';
        await trip.save();
        const summary = `${trip.itinerary?.stats?.totalDays || ''}-day trip to ${normalizedCities[0].name}, ${pace} pace`;
        return (0, responseHelper_1.sendSuccess)(res, 'Trip plan created', {
            tripId: String(trip._id),
            summary,
            importantFields: [],
            trips: [
                {
                    id: String(trip._id),
                    name: trip.title,
                    destination: normalizedCities[0].name,
                    duration: `${trip.itinerary?.stats?.totalDays || 0} days`,
                    travelers,
                    image: '',
                },
            ],
        });
    }
    catch (error) {
        console.error('AI trip creation error:', error);
        return (0, responseHelper_1.sendError)(res, 'Server error while creating AI trip', 500, error?.message);
    }
};
exports.createTripFromPrompt = createTripFromPrompt;
