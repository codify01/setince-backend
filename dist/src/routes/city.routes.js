"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const city_controller_1 = require("../controllers/city.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cityRouter = (0, express_1.Router)();
cityRouter.get('/', city_controller_1.listCities);
cityRouter.post('/', auth_middleware_1.protect, city_controller_1.createCity);
exports.default = cityRouter;
