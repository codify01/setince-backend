import { Router } from "express";
import { addPlace, addPlacesBulk, deletePlace, fetchAllPlaces, fetchPlaceById, searchPlaces, updatePlace } from "../controllers/place.controller";

const placesRouter = Router();


placesRouter.get('/', fetchAllPlaces);
placesRouter.get('/:id', fetchPlaceById);
placesRouter.get('/search/:query', searchPlaces);
placesRouter.post('/create', addPlace);
placesRouter.post('/create-bulk', addPlacesBulk); 
placesRouter.put('/update/:id', updatePlace);
placesRouter.delete('/delete/:id', deletePlace);


export default placesRouter;