"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("./src/config/mongoose");
const auth_routes_1 = __importDefault(require("./src/routes/auth.routes"));
const places_routes_1 = __importDefault(require("./src/routes/places.routes"));
const itinerary_routes_1 = __importDefault(require("./src/routes/itinerary.routes"));
const user_routes_1 = __importDefault(require("./src/routes/user.routes"));
const tabs_routes_1 = __importDefault(require("./src/routes/tabs.routes"));
const categories_routes_1 = __importDefault(require("./src/routes/categories.routes"));
const reviews_routes_1 = __importDefault(require("./src/routes/reviews.routes"));
const city_routes_1 = __importDefault(require("./src/routes/city.routes"));
const trip_routes_1 = __importDefault(require("./src/routes/trip.routes"));
const ai_routes_1 = __importDefault(require("./src/routes/ai.routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./src/config/swagger"));
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (_req, res) => {
    res.send('Hello, Setince!');
});
app.get('/api-docs.json', (_req, res) => {
    res.json(swagger_1.default);
});
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/itineraries', itinerary_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/places', places_routes_1.default);
app.use('/api/tabs', tabs_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/reviews', reviews_routes_1.default);
app.use('/api/cities', city_routes_1.default);
app.use('/api/trips', trip_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
(0, mongoose_1.mongooseConfig)();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
