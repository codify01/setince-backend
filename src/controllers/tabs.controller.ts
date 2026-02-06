import PlacesModel from '../models/places.model';
import ItineraryModel from '../models/itinerary.model';

const toStringId = (value: any) => String(value?._id ?? value ?? '');

const parseNumber = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (km: number | null) => {
  if (km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

const getUserSummary = (user: any) => ({
  _id: toStringId(user),
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  username: user?.username || '',
  avatar: user?.profilePicture || '',
});

export const getHomeTab = async (req, res) => {
  try {
    const lat = parseNumber(req.query.lat);
    const lng = parseNumber(req.query.lng);

    const [placesForCategories, topPlaces, recentTrips] = await Promise.all([
      PlacesModel.find({ category: { $exists: true, $ne: '' } })
        .select('category images')
        .limit(100),
      PlacesModel.find({})
        .sort({ 'ratings.averageRating': -1, createdAt: -1 })
        .select('name description images ratings location category')
        .limit(20),
      ItineraryModel.find({ user: req.user?._id })
        .sort({ createdAt: -1 })
        .select('title startDate')
        .limit(5),
    ]);

    const categoryMap = new Map<string, string>();
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
  } catch (error: any) {
    console.error('Error building home tab:', error);
    return res.status(500).json({ message: 'Failed to build home tab' });
  }
};

export const getExploreTab = async (req, res) => {
  try {
    const lat = parseNumber(req.query.lat);
    const lng = parseNumber(req.query.lng);

    const [placesForCategories, topPlaces, places] = await Promise.all([
      PlacesModel.find({ category: { $exists: true, $ne: '' } })
        .select('category images')
        .limit(100),
      PlacesModel.find({})
        .sort({ 'ratings.averageRating': -1, createdAt: -1 })
        .select('name images ratings category location')
        .limit(10),
      PlacesModel.find({})
        .select('name address images')
        .limit(30),
    ]);

    const categoryMap = new Map<string, string>();
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
  } catch (error: any) {
    console.error('Error building explore tab:', error);
    return res.status(500).json({ message: 'Failed to build explore tab' });
  }
};

export const getTripsTab = async (req, res) => {
  try {
    const itineraries = await ItineraryModel.find({ user: req.user?._id }).sort({
      createdAt: -1,
    });

    const trips = itineraries.map((itinerary: any) => {
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
  } catch (error: any) {
    console.error('Error building trips tab:', error);
    return res.status(500).json({ message: 'Failed to build trips tab' });
  }
};

export const getProfileTab = async (req, res) => {
  try {
    const itineraries = await ItineraryModel.find({ user: req.user?._id }).select(
      'places'
    );
    let placesVisited = 0;
    for (const itinerary of itineraries) {
      placesVisited += itinerary.places?.filter((p: any) => p.visited).length || 0;
    }

    return res.json({
      user: getUserSummary(req.user),
      activity: {
        tripsCreated: itineraries.length,
        placesVisited,
        favorites: 0,
      },
    });
  } catch (error: any) {
    console.error('Error building profile tab:', error);
    return res.status(500).json({ message: 'Failed to build profile tab' });
  }
};

export const getSavedTab = async (_req, res) => {
  return res.json({ items: [] });
};
