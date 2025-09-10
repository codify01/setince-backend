import mongoose from "mongoose";
import ItineraryModel from "../models/itinerary.model";

// Create itinerary
export const createItinerary = async (req, res) => {
  try {
    const { title, description, places, startDate, endDate, notes } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "Title, startDate, and endDate are required." });
    }

   const formattedPlaces = places.map((id: string) => (
        { place: new mongoose.Types.ObjectId(id)}
   ));


    const itinerary = await ItineraryModel.create({
      user: req.user._id,
      title,
      description,
      places: formattedPlaces,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({ success: true, data: itinerary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all itineraries (for logged-in user)
export const getItineraries = async (req, res) => {
  try {
    const itineraries = await ItineraryModel.find({ user: req.user._id });
    res.status(200).json({ success: true, data: itineraries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single itinerary by ID
export const getItineraryById = async (req, res) => {
  try {
    const itinerary = await ItineraryModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.status(200).json({ success: true, data: itinerary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update itinerary
export const updateItinerary = async (req, res) => {
  try {
    const { title, description, places, startDate, endDate, notes } = req.body;

    const itinerary = await ItineraryModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, places, startDate, endDate, notes },
      { new: true, runValidators: true }
    );

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.status(200).json({ success: true, data: itinerary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete itinerary
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await ItineraryModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.status(200).json({ success: true, message: "Itinerary deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark place as visited / unvisited inside an itinerary
export const togglePlaceVisited = async (req, res) => {
  try {
    const { itineraryId, placeId } = req.params;

    const itinerary = await ItineraryModel.findOne({
      _id: itineraryId,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    const place = itinerary.places.find((p) => p.place.toString() === placeId);

    if (!place) {
      return res.status(404).json({ message: "Place not found in itinerary" });
    }

    place.visited = !place.visited;
    await itinerary.save();

    res.status(200).json({ success: true, data: itinerary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
