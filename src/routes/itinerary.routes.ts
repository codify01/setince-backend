import { Router } from "express";
import {
  createItinerary,
  getItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  togglePlaceVisited,
} from "../controllers/itinerary.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect)

router.post("/", createItinerary);
router.get("/", getItineraries);
router.get("/:id", getItineraryById);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

// Custom route for marking places visited/unvisited
router.patch("/:itineraryId/places/:placeId/toggle", togglePlaceVisited);

export default router;
