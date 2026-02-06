"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedTab = exports.getProfileTab = exports.getTripsTab = exports.getExploreTab = exports.getHomeTab = void 0;
const places_model_1 = __importDefault(require("../models/places.model"));
const itinerary_model_1 = __importDefault(require("../models/itinerary.model"));
const toStringId = (value) => String(value?._id ?? value ?? '');
const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const formatDistance = (km) => {
    if (km === null)
        return '';
    if (km < 1)
        return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
};
const getUserSummary = (user) => ({
    _id: toStringId(user),
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    avatar: user?.profilePicture || '',
});
const getHomeTab = async (req, res) => {
    try {
        const lat = parseNumber(req.query.lat);
        const lng = parseNumber(req.query.lng);
        const [placesForCategories, topPlaces, recentTrips] = await Promise.all([
            places_model_1.default.find({ category: { $exists: true, $ne: '' } })
                .select('category images')
                .limit(100),
            places_model_1.default.find({})
                .sort({ 'ratings.averageRating': -1, createdAt: -1 })
                .select('name description images ratings location category')
                .limit(20),
            itinerary_model_1.default.find({ user: req.user?._id })
                .sort({ createdAt: -1 })
                .select('title startDate')
                .limit(5),
        ]);
        const categoryMap = new Map();
        for (const place of placesForCategories) {
            if (place.category && !categoryMap.has(place.category)) {
                categoryMap.set(place.category, place.images?.[0] || '');
            }
        }
        const categories = Array.from(categoryMap.entries()).map(([title, image]) => ({
            id: title,
            title,
            image,
        }));
        const trending = topPlaces.slice(0, 6).map((place) => ({
            id: toStringId(place),
            name: place.name || '',
            image: place.images?.[0] || '',
        }));
        const recommendedPlaces = topPlaces.slice(0, 6).map((place) => ({
            _id: toStringId(place),
            name: place.name || '',
            description: place.description || '',
            rating: place.ratings?.averageRating ?? 0,
            images: place.images || [],
        }));
        const nearbyPlaces = topPlaces.slice(0, 6).map((place) => {
            let distance = '';
            if (lat !== null && lng !== null) {
                const placeLat = parseNumber(place.location?.latitude);
                const placeLng = parseNumber(place.location?.longitude);
                if (placeLat !== null && placeLng !== null) {
                    const km = getDistanceKm(lat, lng, placeLat, placeLng);
                    distance = formatDistance(km);
                }
            }
            return {
                id: toStringId(place),
                name: place.name || '',
                distance,
                image: place.images?.[0] || '',
                rating: place.ratings?.averageRating ?? 0,
            };
        });
        const recentTripsData = recentTrips.map((trip) => ({
            id: toStringId(trip),
            name: trip.title || '',
            date: trip.startDate
                ? new Date(trip.startDate).toISOString().slice(0, 10)
                : '',
            image: '',
        }));
        return res.json({
            user: {
                _id: toStringId(req.user),
                firstName: req.user?.firstName || '',
            },
            categories,
            trending,
            recommendedPlaces,
            nearbyPlaces,
            recentTrips: recentTripsData,
        });
    }
    catch (error) {
        console.error('Error building home tab:', error);
        return res.status(500).json({ message: 'Failed to build home tab' });
    }
};
exports.getHomeTab = getHomeTab;
const getExploreTab = async (req, res) => {
    try {
        const lat = parseNumber(req.query.lat);
        const lng = parseNumber(req.query.lng);
        const [placesForCategories, topPlaces, places] = await Promise.all([
            places_model_1.default.find({ category: { $exists: true, $ne: '' } })
                .select('category images')
                .limit(100),
            places_model_1.default.find({})
                .sort({ 'ratings.averageRating': -1, createdAt: -1 })
                .select('name images ratings category location')
                .limit(10),
            places_model_1.default.find({})
                .select('name address images')
                .limit(30),
        ]);
        const categoryMap = new Map();
        for (const place of placesForCategories) {
            if (place.category && !categoryMap.has(place.category)) {
                categoryMap.set(place.category, place.images?.[0] || '');
            }
        }
        const categories = Array.from(categoryMap.entries()).map(([name, icon]) => ({
            name,
            icon,
            value: name,
        }));
        const trending = topPlaces.map((place) => {
            let distance = '';
            if (lat !== null && lng !== null) {
                const placeLat = parseNumber(place.location?.latitude);
                const placeLng = parseNumber(place.location?.longitude);
                if (placeLat !== null && placeLng !== null) {
                    const km = getDistanceKm(lat, lng, placeLat, placeLng);
                    distance = formatDistance(km);
                }
            }
            return {
                id: toStringId(place),
                name: place.name || '',
                cuisine: place.category || '',
                distance,
                rating: place.ratings?.averageRating ?? 0,
                reviews: place.ratings?.numberOfRatings ?? 0,
                image: place.images?.[0] || '',
            };
        });
        const placesData = places.map((place) => ({
            _id: toStringId(place),
            name: place.name || '',
            address: place.address || '',
            images: place.images || [],
        }));
        return res.json({
            categories,
            trending,
            places: placesData,
        });
    }
    catch (error) {
        console.error('Error building explore tab:', error);
        return res.status(500).json({ message: 'Failed to build explore tab' });
    }
};
exports.getExploreTab = getExploreTab;
const getTripsTab = async (req, res) => {
    try {
        const itineraries = await itinerary_model_1.default.find({ user: req.user?._id }).sort({
            createdAt: -1,
        });
        const trips = itineraries.map((itinerary) => {
            const startDate = itinerary.startDate
                ? new Date(itinerary.startDate).getTime()
                : null;
            const endDate = itinerary.endDate
                ? new Date(itinerary.endDate).getTime()
                : null;
            let duration = '';
            if (startDate !== null && endDate !== null) {
                const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                duration = `${diffDays} days`;
            }
            return {
                id: toStringId(itinerary),
                name: itinerary.title || '',
                destination: itinerary.description || '',
                duration,
                travelers: 1,
                image: '',
                placesCount: itinerary.places?.length || 0,
            };
        });
        return res.json({ trips });
    }
    catch (error) {
        console.error('Error building trips tab:', error);
        return res.status(500).json({ message: 'Failed to build trips tab' });
    }
};
exports.getTripsTab = getTripsTab;
const getProfileTab = async (req, res) => {
    try {
        const itineraries = await itinerary_model_1.default.find({ user: req.user?._id }).select('places');
        let placesVisited = 0;
        for (const itinerary of itineraries) {
            placesVisited += itinerary.places?.filter((p) => p.visited).length || 0;
        }
        return res.json({
            user: getUserSummary(req.user),
            activity: {
                tripsCreated: itineraries.length,
                placesVisited,
                favorites: 0,
            },
        });
    }
    catch (error) {
        console.error('Error building profile tab:', error);
        return res.status(500).json({ message: 'Failed to build profile tab' });
    }
};
exports.getProfileTab = getProfileTab;
const getSavedTab = async (_req, res) => {
    return res.json({ items: [] });
};
exports.getSavedTab = getSavedTab;
