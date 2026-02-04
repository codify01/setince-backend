import PlacesModel, { Place } from "../models/places.model";

export const createPlace = async (placeData:Place) => {
    try {
        const place = new PlacesModel(placeData);
        await place.save();
        return place;
    } catch (error) {
        console.error("Error creating place:", error);
        throw new Error(error);
    }
}

export const createPlacesBulk = async (placesData: Place[]) => {
    try {
        const places = await PlacesModel.insertMany(placesData);
        return places;
    } catch (error) {
        console.error("Error creating places in bulk:", error);
        throw new Error("Bulk place creation failed");
    }
}

export const getPlaceById = async (placeId: string) => {
    try {
        const place = await PlacesModel.findById(placeId);
        if (!place) {
            throw new Error("Place not found");
        }
        return place;
    } catch (error) {
        console.error("Error fetching place:", error);
        throw new Error("Place fetch failed");
    }
}

export const getAllPlaces = async () => {
    try {
        const places = await PlacesModel.find();
        return places;
    } catch (error) {
        console.error("Error fetching places:", error);
        throw new Error("Places fetch failed");
    }
}

export const autocompletePlaces = async (query: string, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const places = await PlacesModel.find({
      approved: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name address images category')
      .limit(limit);

    return places;
  } catch (error) {
    console.error('Autocomplete search failed:', error);
    throw new Error('Autocomplete search failed');
  }
};

export const updatePlaceById = async (placeId: string, updateData: Partial<Place>) => {
    try {
        const place = await PlacesModel.findByIdAndUpdate(placeId, updateData, { new: true });
        if (!place) {
            throw new Error("Place not found");
        }
        return place; 
    } catch (error) {
        console.error("Error updating place:", error);
        throw new Error("Place update failed");
    }
}

export const deletePlaceById = async (placeId: string) => {
    try {
        const place = await PlacesModel.findByIdAndDelete(placeId);
        if (!place) {
            throw new Error("Place not found");
        }
        return place;
    } catch (error) {
        console.error("Error deleting place:", error);
        throw new Error("Place deletion failed");
    }
}