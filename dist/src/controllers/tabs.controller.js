"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedTab = exports.getProfileTab = exports.getTripsTab = exports.getExploreTab = exports.getHomeTab = void 0;
const places_model_1 = __importDefault(require("../models/places.model"));
const itinerary_model_1 = __importDefault(require("../models/itinerary.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const trip_model_1 = __importDefault(require("../models/trip.model"));
const placeServices_1 = require("../services/placeServices");
const mapboxMatrix_service_1 = require("../services/mapboxMatrix.service");
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
const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds))
        return '';
    const minutes = Math.max(1, Math.round(seconds / 60));
    if (minutes < 60)
        return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};
const scoreByRatingAndTime = (rating, travelSeconds) => {
    const ratingScore = Math.max(0, Math.min(1, rating / 5));
    const travelMinutes = Number.isFinite(travelSeconds) ? travelSeconds / 60 : 120;
    const distanceScore = Math.max(0, 1 - travelMinutes / 60);
    return 0.6 * ratingScore + 0.4 * distanceScore;
};
const buildTravelDurationMap = async (origin, places) => {
    const durations = new Array(places.length).fill(Number.POSITIVE_INFINITY);
    const destinations = [];
    const indices = [];
    places.forEach((place, index) => {
        const lat = Number(place.location?.latitude);
        const lng = Number(place.location?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            destinations.push({ lat, lng });
            indices.push(index);
        }
    });
    if (destinations.length === 0) {
        return durations;
    }
    try {
        const matrix = await (0, mapboxMatrix_service_1.getTravelTimesFromOrigin)(origin, destinations, 'mapbox/driving-traffic');
        matrix.durations.forEach((duration, idx) => {
            const placeIndex = indices[idx];
            if (placeIndex !== undefined) {
                durations[placeIndex] = duration;
            }
        });
    }
    catch (_error) {
        return durations;
    }
    return durations;
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
        const [categoriesSource, topPlaces, recentTrips] = await Promise.all([
            category_model_1.default.find({ isActive: true }).select('title image'),
            places_model_1.default.find({})
                .sort({ 'ratings.averageRating': -1, createdAt: -1 })
                .select('name description images ratings location category categoryId')
                .populate('categoryId', 'title')
                .limit(20),
            itinerary_model_1.default.find({ user: req.user?._id })
                .sort({ createdAt: -1 })
                .select('title startDate')
                .limit(5),
        ]);
        const categories = categoriesSource.length > 0
            ? categoriesSource.map((category) => ({
                id: toStringId(category),
                title: category.title || '',
                image: category.image || '',
            }))
            : [];
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
        let nearbySource = topPlaces;
        if (lat !== null && lng !== null) {
            try {
                nearbySource = await (0, placeServices_1.getNearbyPlaces)(lat, lng, 20, 50000);
            }
            catch (_error) {
                nearbySource = topPlaces;
            }
        }
        const travelDurations = lat !== null && lng !== null
            ? await buildTravelDurationMap({ lat, lng }, nearbySource)
            : [];
        const scoredNearby = nearbySource.map((place, index) => {
            const duration = travelDurations[index] ?? Number.POSITIVE_INFINITY;
            return {
                place,
                duration,
                score: scoreByRatingAndTime(place.ratings?.averageRating ?? 0, duration),
            };
        });
        scoredNearby.sort((a, b) => b.score - a.score);
        const nearbyPlaces = scoredNearby.slice(0, 6).map(({ place, duration }) => {
            let distance = '';
            if (lat !== null && lng !== null) {
                const placeLat = parseNumber(place.location?.latitude);
                const placeLng = parseNumber(place.location?.longitude);
                if (placeLat !== null && placeLng !== null) {
                    const km = getDistanceKm(lat, lng, placeLat, placeLng);
                    distance = formatDuration(duration) || formatDistance(km);
                }
                else if (Number.isFinite(place.distanceMeters)) {
                    distance = formatDistance(place.distanceMeters / 1000);
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
        const [categoriesSource, topPlaces, places] = await Promise.all([
            category_model_1.default.find({ isActive: true }).select('title icon value'),
            places_model_1.default.find({})
                .sort({ 'ratings.averageRating': -1, createdAt: -1 })
                .select('name images ratings category categoryId location')
                .populate('categoryId', 'title')
                .limit(10),
            places_model_1.default.find({})
                .select('name address images category categoryId')
                .populate('categoryId', 'title')
                .limit(30),
        ]);
        const categories = categoriesSource.map((category) => ({
            name: category.title || '',
            icon: category.icon || '',
            value: category.value || '',
        }));
        let trendingSource = topPlaces;
        if (lat !== null && lng !== null) {
            try {
                trendingSource = await (0, placeServices_1.getNearbyPlaces)(lat, lng, 20, 50000);
            }
            catch (_error) {
                trendingSource = topPlaces;
            }
        }
        const trendingDurations = lat !== null && lng !== null
            ? await buildTravelDurationMap({ lat, lng }, trendingSource)
            : [];
        const scoredTrending = trendingSource.map((place, index) => ({
            place,
            duration: trendingDurations[index] ?? Number.POSITIVE_INFINITY,
            score: scoreByRatingAndTime(place.ratings?.averageRating ?? 0, trendingDurations[index] ?? Number.POSITIVE_INFINITY),
        }));
        scoredTrending.sort((a, b) => b.score - a.score);
        const trending = scoredTrending.map(({ place, duration }) => {
            let distance = '';
            if (lat !== null && lng !== null) {
                const placeLat = parseNumber(place.location?.latitude);
                const placeLng = parseNumber(place.location?.longitude);
                if (placeLat !== null && placeLng !== null) {
                    const km = getDistanceKm(lat, lng, placeLat, placeLng);
                    distance = formatDuration(duration) || formatDistance(km);
                }
            }
            return {
                id: toStringId(place),
                name: place.name || '',
                cuisine: place.categoryId?.title ||
                    place.category ||
                    '',
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
        const tripsData = await trip_model_1.default.find().sort({
            createdAt: -1,
        });
        let trips = tripsData.map((trip) => {
            const startDate = trip.startDate ? new Date(trip.startDate).getTime() : null;
            const endDate = trip.endDate ? new Date(trip.endDate).getTime() : null;
            let duration = '';
            if (startDate !== null && endDate !== null) {
                const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                duration = `${diffDays} days`;
            }
            return {
                id: toStringId(trip),
                name: trip.title || '',
                destination: trip.cities?.[0]?.name || '',
                duration,
                travelers: 1,
                image: trip.images?.[0] || '',
            };
        });
        if (trips.length === 0) {
            const itineraries = await itinerary_model_1.default.find({ user: req.user?._id }).sort({
                createdAt: -1,
            });
            trips = itineraries.map((itinerary) => {
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
                    image: itinerary.image || '',
                };
            });
        }
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
