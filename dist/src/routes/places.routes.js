"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const place_controller_1 = require("../controllers/place.controller");
const placesRouter = (0, express_1.Router)();
placesRouter.get('/', place_controller_1.fetchAllPlaces);
placesRouter.get('/:id', place_controller_1.fetchPlaceById);
placesRouter.post('/create', place_controller_1.addPlace);
exports.default = placesRouter;
