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

export const updatePlace = async (placeId: string, updateData: Partial<Place>) => {
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

export const deletePlace = async (placeId: string) => {
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