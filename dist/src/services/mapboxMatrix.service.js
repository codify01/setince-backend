"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTravelTimesFromOrigin = void 0;
const MATRIX_BASE_URL = 'https://api.mapbox.com/directions-matrix/v1';
const MATRIX_LIMITS = {
    'mapbox/driving-traffic': 10,
    'mapbox/driving': 25,
    'mapbox/walking': 25,
    'mapbox/cycling': 25,
};
const cache = new Map();
const getCache = (key) => {
    const cached = cache.get(key);
    if (!cached)
        return null;
    if (Date.now() > cached.expiresAt) {
        cache.delete(key);
        return null;
    }
    return cached.value;
};
const setCache = (key, value, ttlMs) => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};
const buildCacheKey = (profile, origin, destinations) => {
    const coords = destinations
        .map((d) => `${d.lng.toFixed(5)},${d.lat.toFixed(5)}`)
        .join('|');
    return `${profile}:${origin.lng.toFixed(5)},${origin.lat.toFixed(5)}:${coords}`;
};
const chunkDestinations = (destinations, maxCoords) => {
    const maxDestinations = Math.max(1, maxCoords - 1);
    const chunks = [];
    for (let i = 0; i < destinations.length; i += maxDestinations) {
        chunks.push(destinations.slice(i, i + maxDestinations));
    }
    return chunks;
};
const fetchMatrix = async (profile, origin, destinations, token) => {
    if (!globalThis.fetch) {
        throw new Error('Fetch API is not available in this runtime');
    }
    const coordinates = [
        `${origin.lng},${origin.lat}`,
        ...destinations.map((d) => `${d.lng},${d.lat}`),
    ].join(';');
    const destinationIndexes = destinations.map((_d, idx) => idx + 1).join(';');
    const url = `${MATRIX_BASE_URL}/${profile}/${coordinates}` +
        `?sources=0&destinations=${destinationIndexes}` +
        `&annotations=duration` +
        `&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Mapbox Matrix API error: ${response.status} ${text}`);
    }
    const data = await response.json();
    const durations = (data?.durations?.[0] || []);
    return {
        durations: durations.map((d) => (typeof d === 'number' ? d : Number.POSITIVE_INFINITY)),
    };
};
const getTravelTimesFromOrigin = async (origin, destinations, profile = 'mapbox/driving-traffic') => {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
        throw new Error('MAPBOX_ACCESS_TOKEN is not set');
    }
    const maxCoords = MATRIX_LIMITS[profile] || 25;
    const chunks = chunkDestinations(destinations, maxCoords);
    const durations = [];
    for (const chunk of chunks) {
        const cacheKey = buildCacheKey(profile, origin, chunk);
        const cached = getCache(cacheKey);
        if (cached) {
            durations.push(...cached.durations);
            continue;
        }
        const result = await fetchMatrix(profile, origin, chunk, token);
        durations.push(...result.durations);
        setCache(cacheKey, result, 5 * 60 * 1000);
    }
    return { durations };
};
exports.getTravelTimesFromOrigin = getTravelTimesFromOrigin;
