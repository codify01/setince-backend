"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const places_model_1 = __importDefault(require("../models/places.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const mapboxMatrix_service_1 = require("./mapboxMatrix.service");
const paceConfig = (pace) => {
    switch (pace) {
        case 'relaxed':
            return { maxActivities: 3, maxHours: 6 };
        case 'packed':
            return { maxActivities: 5, maxHours: 8 };
        case 'normal':
        default:
            return { maxActivities: 4, maxHours: 7 };
    }
};
const toMinutes = (time) => {
    const [h, m] = time.split(':').map((n) => Number(n));
    return h * 60 + m;
};
const toTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
const distanceKm = (lat1, lon1, lat2, lon2) => {
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
const estimateTravelMinutes = (a, b) => {
    const lat1 = Number(a?.location?.latitude);
    const lon1 = Number(a?.location?.longitude);
    const lat2 = Number(b?.location?.latitude);
    const lon2 = Number(b?.location?.longitude);
    if (!Number.isFinite(lat1) || !Number.isFinite(lon1))
        return 20;
    if (!Number.isFinite(lat2) || !Number.isFinite(lon2))
        return 20;
    const km = distanceKm(lat1, lon1, lat2, lon2);
    const minutes = Math.round((km / 25) * 60);
    return Math.min(60, Math.max(10, minutes));
};
const buildTravelTimeMatrix = async (places) => {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token || places.length === 0 || places.length > 10) {
        return null;
    }
    const coords = places.map((place) => ({
        lat: Number(place.location?.latitude),
        lng: Number(place.location?.longitude),
    }));
    if (coords.some((c) => !Number.isFinite(c.lat) || !Number.isFinite(c.lng))) {
        return null;
    }
    const matrix = [];
    for (let i = 0; i < coords.length; i += 1) {
        const origin = coords[i];
        const destinations = coords;
        const result = await (0, mapboxMatrix_service_1.getTravelTimesFromOrigin)(origin, destinations, 'mapbox/driving-traffic');
        matrix.push(result.durations.map((d) => Math.round(d / 60)));
    }
    return matrix;
};
const getMatrixMinutes = (matrix, aIndex, bIndex) => {
    if (!matrix)
        return null;
    const row = matrix[aIndex];
    if (!row)
        return null;
    const value = row[bIndex];
    return Number.isFinite(value) ? value : null;
};
const estimateDurationMinutes = (place) => {
    const category = String(place?.category || place?.categoryId?.title || '').toLowerCase();
    if (category.includes('museum'))
        return 120;
    if (category.includes('park'))
        return 120;
    if (category.includes('restaurant'))
        return 90;
    if (category.includes('night'))
        return 90;
    return 90;
};
const getOpeningWindow = (place, date) => {
    const day = date.getDay();
    const weekly = place?.openingHoursWeekly || [];
    const entry = weekly.find((item) => item.day === day);
    if (entry?.open && entry?.close) {
        return { open: toMinutes(entry.open), close: toMinutes(entry.close) };
    }
    return { open: toMinutes('09:00'), close: toMinutes('18:00') };
};
const canSchedule = (place, date, startMinutes, durationMinutes) => {
    const { open, close } = getOpeningWindow(place, date);
    const end = startMinutes + durationMinutes;
    return startMinutes >= open && end <= close;
};
const sortByRating = (places) => {
    return places.sort((a, b) => {
        const ar = a?.ratings?.averageRating || 0;
        const br = b?.ratings?.averageRating || 0;
        if (br !== ar)
            return br - ar;
        const ac = a?.ratings?.numberOfRatings || 0;
        const bc = b?.ratings?.numberOfRatings || 0;
        return bc - ac;
    });
};
const nearestNeighborSort = (places, matrix, indexMap) => {
    if (places.length <= 2)
        return places;
    const remaining = places.slice();
    const sorted = [];
    sorted.push(remaining.shift());
    while (remaining.length) {
        const last = sorted[sorted.length - 1];
        const lastIndex = indexMap.get(String(last?._id));
        let bestIndex = 0;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < remaining.length; i += 1) {
            const candidate = remaining[i];
            let distance = estimateTravelMinutes(last, candidate);
            if (lastIndex !== undefined) {
                const candidateIndex = indexMap.get(String(candidate?._id));
                if (candidateIndex !== undefined) {
                    const matrixMinutes = getMatrixMinutes(matrix, lastIndex, candidateIndex);
                    if (matrixMinutes !== null)
                        distance = matrixMinutes;
                }
            }
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        }
        sorted.push(remaining.splice(bestIndex, 1)[0]);
    }
    return sorted;
};
const generateItinerary = async (input) => {
    const warnings = [];
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new Error('Invalid trip dates');
    }
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (totalDays <= 0) {
        throw new Error('Trip duration must be at least 1 day');
    }
    const cityIds = input.cities.map((c) => c.cityId);
    const cities = await city_model_1.default.find({ _id: { $in: cityIds } });
    const placesQuery = {
        $or: [
            { cityId: { $in: cityIds } },
            { city: { $in: cities.map((c) => c.name) } },
        ],
    };
    const selectedPlaceIds = input.selectedPlaceIds || [];
    if (selectedPlaceIds.length > 0) {
        placesQuery._id = { $in: selectedPlaceIds };
    }
    let places = await places_model_1.default.find(placesQuery)
        .populate('categoryId', 'title')
        .lean();
    if (places.length === 0) {
        warnings.push('No places found for selected cities');
    }
    places = sortByRating(places);
    const placesByCity = new Map();
    for (const place of places) {
        const cityId = String(place.cityId || '');
        const cityName = String(place.city || '');
        const key = cityId || cityName || 'unknown';
        if (!placesByCity.has(key))
            placesByCity.set(key, []);
        placesByCity.get(key)?.push(place);
    }
    const citiesWithCounts = input.cities.map((city) => {
        const key = city.cityId || city.name || '';
        return {
            city,
            count: placesByCity.get(key)?.length || 0,
        };
    });
    citiesWithCounts.sort((a, b) => b.count - a.count);
    const usableCities = totalDays < citiesWithCounts.length
        ? citiesWithCounts.slice(0, totalDays)
        : citiesWithCounts;
    if (totalDays < citiesWithCounts.length) {
        warnings.push('Trip shorter than number of cities; some cities were skipped');
    }
    const dayAssignments = [];
    if (usableCities.length === 0) {
        usableCities.push(...citiesWithCounts);
    }
    const baseDays = Math.floor(totalDays / usableCities.length);
    let remainder = totalDays % usableCities.length;
    for (const entry of usableCities) {
        const extra = remainder > 0 ? 1 : 0;
        dayAssignments.push({ city: entry.city, dayCount: baseDays + extra });
        remainder -= extra;
    }
    const { maxActivities, maxHours } = paceConfig(input.pace);
    const startHour = input.preferredStartHour ?? 9;
    const endHour = input.preferredEndHour ?? 18;
    const days = [];
    let currentDate = new Date(startDate);
    let totalActivities = 0;
    const allowSameDayCityTravel = input.allowSameDayCityTravel ?? false;
    const travelDaysNeeded = allowSameDayCityTravel ? 0 : Math.max(0, usableCities.length - 1);
    const travelDaysAvailable = Math.max(0, totalDays - usableCities.length);
    const travelDaysToUse = Math.min(travelDaysNeeded, travelDaysAvailable);
    if (travelDaysNeeded > travelDaysAvailable && !allowSameDayCityTravel) {
        warnings.push('Not enough days for travel between cities; some travel days omitted');
    }
    let remainingTravelDays = travelDaysToUse;
    for (let i = 0; i < dayAssignments.length; i += 1) {
        const assignment = dayAssignments[i];
        const cityId = assignment.city.cityId;
        const cityKey = cityId || assignment.city.name || '';
        const cityPlaces = placesByCity.get(cityKey) || [];
        const indexMap = new Map();
        cityPlaces.forEach((place, index) => {
            indexMap.set(String(place._id), index);
        });
        const matrix = await buildTravelTimeMatrix(cityPlaces);
        const orderedPlaces = nearestNeighborSort(cityPlaces, matrix, indexMap);
        for (let d = 0; d < assignment.dayCount; d += 1) {
            const blocks = [];
            let cursor = startHour * 60;
            const dayEnd = endHour * 60;
            let activities = 0;
            let hoursPlanned = 0;
            let lastPlace = null;
            for (const place of orderedPlaces) {
                if (activities >= maxActivities)
                    break;
                const duration = estimateDurationMinutes(place);
                if (lastPlace) {
                    let travelMinutes = estimateTravelMinutes(lastPlace, place);
                    const lastIndex = indexMap.get(String(lastPlace?._id));
                    const placeIndex = indexMap.get(String(place?._id));
                    if (lastIndex !== undefined && placeIndex !== undefined) {
                        const matrixMinutes = getMatrixMinutes(matrix, lastIndex, placeIndex);
                        if (matrixMinutes !== null)
                            travelMinutes = matrixMinutes;
                    }
                    if (cursor + travelMinutes >= dayEnd)
                        break;
                    blocks.push({
                        type: 'travel',
                        title: 'Travel',
                        startTime: toTime(cursor),
                        endTime: toTime(cursor + travelMinutes),
                        travelMinutes,
                        city: cityId ? new mongoose_1.default.Types.ObjectId(cityId) : undefined,
                    });
                    cursor += travelMinutes;
                }
                if (!canSchedule(place, currentDate, cursor, duration)) {
                    continue;
                }
                if (cursor + duration > dayEnd)
                    break;
                blocks.push({
                    type: 'activity',
                    title: place.name || 'Attraction',
                    place: place._id,
                    startTime: toTime(cursor),
                    endTime: toTime(cursor + duration),
                    city: cityId ? new mongoose_1.default.Types.ObjectId(cityId) : undefined,
                    notes: place.category || '',
                });
                cursor += duration;
                hoursPlanned += duration / 60;
                activities += 1;
                totalActivities += 1;
                lastPlace = place;
                if (cursor >= toMinutes('12:30') && cursor <= toMinutes('13:30')) {
                    const mealDuration = 60;
                    if (cursor + mealDuration <= dayEnd) {
                        blocks.push({
                            type: 'meal',
                            title: 'Lunch break',
                            startTime: toTime(cursor),
                            endTime: toTime(cursor + mealDuration),
                            city: cityId ? new mongoose_1.default.Types.ObjectId(cityId) : undefined,
                        });
                        cursor += mealDuration;
                        hoursPlanned += mealDuration / 60;
                    }
                }
                if (hoursPlanned >= maxHours)
                    break;
            }
            if (cursor < dayEnd) {
                blocks.push({
                    type: 'free_time',
                    title: 'Free time',
                    startTime: toTime(cursor),
                    endTime: toTime(dayEnd),
                    city: cityId ? new mongoose_1.default.Types.ObjectId(cityId) : undefined,
                });
            }
            days.push({
                dayNumber: days.length + 1,
                date: new Date(currentDate),
                city: cityId ? new mongoose_1.default.Types.ObjectId(cityId) : undefined,
                cityName: assignment.city.name,
                blocks,
                summary: {
                    totalActivities: activities,
                    totalHours: Number(hoursPlanned.toFixed(1)),
                },
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        if (remainingTravelDays > 0 && i < dayAssignments.length - 1) {
            const fromCity = assignment.city;
            const toCity = dayAssignments[i + 1].city;
            days.push({
                dayNumber: days.length + 1,
                date: new Date(currentDate),
                city: toCity.cityId ? new mongoose_1.default.Types.ObjectId(toCity.cityId) : undefined,
                cityName: toCity.name,
                blocks: [
                    {
                        type: 'travel',
                        title: `Travel from ${fromCity.name || 'City'} to ${toCity.name || 'City'}`,
                        startTime: toTime(startHour * 60),
                        endTime: toTime(endHour * 60),
                        notes: 'Travel day',
                    },
                    {
                        type: 'free_time',
                        title: 'Arrival and rest',
                        startTime: toTime(endHour * 60),
                        endTime: toTime((endHour + 2) * 60),
                    },
                ],
                summary: {
                    totalActivities: 0,
                    totalHours: 0,
                },
            });
            currentDate.setDate(currentDate.getDate() + 1);
            remainingTravelDays -= 1;
        }
    }
    return {
        days,
        stats: {
            totalDays: totalDays,
            totalActivities,
        },
        warnings,
    };
};
exports.generateItinerary = generateItinerary;
