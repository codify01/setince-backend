"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itinerary_controller_1 = require("../controllers/itinerary.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.post("/", itinerary_controller_1.createItinerary);
router.get("/", itinerary_controller_1.getItineraries);
router.get("/:id", itinerary_controller_1.getItineraryById);
router.put("/:id", itinerary_controller_1.updateItinerary);
router.delete("/:id", itinerary_controller_1.deleteItinerary);
// Custom route for marking places visited/unvisited
router.patch("/:itineraryId/places/:placeId/toggle", itinerary_controller_1.togglePlaceVisited);
exports.default = router;
