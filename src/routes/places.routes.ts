import { Router } from "express";
import { addPlace, fetchAllPlaces, fetchPlaceById } from "../controllers/place.controller";

const placesRouter = Router();


placesRouter.get('/', fetchAllPlaces);
placesRouter.get('/:id', fetchPlaceById);
placesRouter.post('/create', addPlace);


export default placesRouter;