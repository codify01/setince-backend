"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Setince API',
        version: '1.0.0',
        description: 'API documentation for the Setince backend.',
    },
    servers: [{ url: baseUrl }],
    tags: [
        { name: 'Auth' },
        { name: 'Users' },
        { name: 'Places' },
        { name: 'Categories' },
        { name: 'Cities' },
        { name: 'Reviews' },
        { name: 'Trips' },
        { name: 'Itineraries' },
        { name: 'Tabs' },
        { name: 'AI' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ObjectId: { type: 'string', example: '60b8d295f1d2c12a3c4d5e6f' },
            DateTime: { type: 'string', format: 'date-time' },
            Date: { type: 'string', format: 'date' },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {},
                },
                required: ['success', 'message'],
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    error: {},
                },
                required: ['success', 'message'],
            },
            User: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['user', 'admin', 'seller', 'super_admin'] },
                    isActive: { type: 'boolean' },
                    lastLogin: { $ref: '#/components/schemas/DateTime' },
                    profilePicture: { type: 'string' },
                    bio: { type: 'string' },
                    preferences: {
                        type: 'object',
                        properties: {
                            theme: { type: 'string' },
                            language: { type: 'string' },
                            notifications: { type: 'boolean' },
                        },
                    },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            UserRegistration: {
                type: 'object',
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                },
                required: ['firstName', 'lastName', 'username', 'email', 'password'],
            },
            LoginRequest: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                },
                required: ['password'],
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { $ref: '#/components/schemas/ObjectId' },
                            username: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            profilePic: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            role: { type: 'string', enum: ['user', 'admin', 'seller', 'super_admin'] },
                        },
                    },
                    token: { type: 'string' },
                },
            },
            PlaceLocation: {
                type: 'object',
                properties: {
                    latitude: { type: 'string' },
                    longitude: { type: 'string' },
                },
                required: ['latitude', 'longitude'],
            },
            PlaceContactInfo: {
                type: 'object',
                properties: {
                    phone: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    website: { type: 'string' },
                },
                required: ['phone', 'email'],
            },
            PlaceOpeningHour: {
                type: 'object',
                properties: {
                    day: { type: 'integer', minimum: 0, maximum: 6 },
                    open: { type: 'string', example: '09:00' },
                    close: { type: 'string', example: '18:00' },
                },
            },
            Place: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    categoryId: { $ref: '#/components/schemas/ObjectId' },
                    city: { type: 'string' },
                    cityId: { $ref: '#/components/schemas/ObjectId' },
                    tags: { type: 'array', items: { type: 'string' } },
                    images: { type: 'array', items: { type: 'string' } },
                    location: { $ref: '#/components/schemas/PlaceLocation' },
                    locationGeo: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', enum: ['Point'] },
                            coordinates: { type: 'array', items: { type: 'number' } },
                        },
                    },
                    address: { type: 'string' },
                    contactInfo: { $ref: '#/components/schemas/PlaceContactInfo' },
                    openingHours: { type: 'string' },
                    openingHoursWeekly: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PlaceOpeningHour' },
                    },
                    entryFee: { type: 'string' },
                    facilities: { type: 'array', items: { type: 'string' } },
                    uniqueFeatures: { type: 'array', items: { type: 'string' } },
                    bestTimeToVisit: { type: 'string' },
                    accessibility: {
                        type: 'object',
                        properties: { gettingThere: { type: 'string' } },
                    },
                    ownership: { type: 'string' },
                    ratings: {
                        type: 'object',
                        properties: {
                            averageRating: { type: 'number', minimum: 0, maximum: 5 },
                            numberOfRatings: { type: 'number', minimum: 0 },
                        },
                    },
                    approved: { type: 'boolean' },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            PlaceCreate: {
                allOf: [
                    { $ref: '#/components/schemas/Place' },
                    {
                        type: 'object',
                        required: ['name', 'description', 'images', 'address', 'location', 'contactInfo'],
                    },
                ],
            },
            PlaceUpdate: {
                type: 'object',
                additionalProperties: true,
            },
            Category: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    title: { type: 'string' },
                    value: { type: 'string' },
                    image: { type: 'string' },
                    icon: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            City: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    name: { type: 'string' },
                    country: { type: 'string' },
                    state: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    timezone: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            Review: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    place: { $ref: '#/components/schemas/ObjectId' },
                    user: { $ref: '#/components/schemas/ObjectId' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    comment: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            TripPreferences: {
                type: 'object',
                properties: {
                    pace: { type: 'string', enum: ['relaxed', 'normal', 'packed'] },
                    interests: { type: 'array', items: { type: 'string' } },
                    allowSameDayCityTravel: { type: 'boolean' },
                    preferredStartHour: { type: 'number' },
                    preferredEndHour: { type: 'number' },
                },
            },
            TripCity: {
                type: 'object',
                properties: {
                    city: { $ref: '#/components/schemas/ObjectId' },
                    name: { type: 'string' },
                },
            },
            ItineraryBlock: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['activity', 'travel', 'free_time', 'meal', 'rest'] },
                    title: { type: 'string' },
                    place: { $ref: '#/components/schemas/ObjectId' },
                    startTime: { type: 'string', example: '09:00' },
                    endTime: { type: 'string', example: '10:30' },
                    city: { $ref: '#/components/schemas/ObjectId' },
                    travelMinutes: { type: 'number' },
                    notes: { type: 'string' },
                },
            },
            ItineraryDay: {
                type: 'object',
                properties: {
                    dayNumber: { type: 'number' },
                    date: { $ref: '#/components/schemas/Date' },
                    city: { $ref: '#/components/schemas/ObjectId' },
                    cityName: { type: 'string' },
                    blocks: { type: 'array', items: { $ref: '#/components/schemas/ItineraryBlock' } },
                    summary: {
                        type: 'object',
                        properties: {
                            totalActivities: { type: 'number' },
                            totalHours: { type: 'number' },
                        },
                    },
                },
            },
            Trip: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    user: { $ref: '#/components/schemas/ObjectId' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    cities: { type: 'array', items: { $ref: '#/components/schemas/TripCity' } },
                    startDate: { $ref: '#/components/schemas/Date' },
                    endDate: { $ref: '#/components/schemas/Date' },
                    preferences: { $ref: '#/components/schemas/TripPreferences' },
                    selectedPlaces: { type: 'array', items: { $ref: '#/components/schemas/ObjectId' } },
                    itinerary: {
                        type: 'object',
                        properties: {
                            days: { type: 'array', items: { $ref: '#/components/schemas/ItineraryDay' } },
                            stats: {
                                type: 'object',
                                properties: {
                                    totalDays: { type: 'number' },
                                    totalActivities: { type: 'number' },
                                },
                            },
                            warnings: { type: 'array', items: { type: 'string' } },
                        },
                    },
                    status: { type: 'string', enum: ['draft', 'generated'] },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            Itinerary: {
                type: 'object',
                properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    user: { $ref: '#/components/schemas/ObjectId' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    places: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                place: { $ref: '#/components/schemas/ObjectId' },
                                day: { type: 'number' },
                                visited: { type: 'boolean' },
                            },
                        },
                    },
                    startDate: { $ref: '#/components/schemas/Date' },
                    endDate: { $ref: '#/components/schemas/Date' },
                    notes: { type: 'string' },
                    durationDays: { type: 'number' },
                    progress: {
                        type: 'object',
                        properties: {
                            visited: { type: 'number' },
                            total: { type: 'number' },
                        },
                    },
                    createdAt: { $ref: '#/components/schemas/DateTime' },
                    updatedAt: { $ref: '#/components/schemas/DateTime' },
                },
            },
            AiTripRequest: {
                type: 'object',
                properties: {
                    prompt: { type: 'string' },
                },
                required: ['prompt'],
            },
        },
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/UserRegistration' } },
                    },
                },
                responses: {
                    '201': {
                        description: 'User created',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
                        },
                    },
                    '400': { description: 'Validation error' },
                    '409': { description: 'User already exists' },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login a user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
                        },
                    },
                    '401': { description: 'Invalid credentials' },
                    '404': { description: 'User not found' },
                },
            },
        },
        '/api/auth/admin/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login an admin user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
                        },
                    },
                    '401': { description: 'Invalid credentials' },
                    '403': { description: 'Access denied' },
                    '404': { description: 'User not found' },
                },
            },
        },
        '/api/users/profile': {
            get: {
                tags: ['Users'],
                summary: 'Get current user profile',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Profile fetched',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/User' } },
                        },
                    },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/api/places': {
            get: {
                tags: ['Places'],
                summary: 'List all places',
                responses: {
                    '200': {
                        description: 'Places fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Place' },
                                },
                            },
                        },
                    },
                    '404': { description: 'No places found' },
                },
            },
        },
        '/api/places/search': {
            get: {
                tags: ['Places'],
                summary: 'Search places',
                parameters: [
                    {
                        name: 'query',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'Search query',
                    },
                    {
                        name: 'approved',
                        in: 'query',
                        schema: { type: 'boolean' },
                        description: 'Filter by approved places only',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Search results',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Place' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/places/{id}': {
            get: {
                tags: ['Places'],
                summary: 'Get place by id',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'Place fetched',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/Place' } },
                        },
                    },
                    '404': { description: 'Place not found' },
                },
            },
        },
        '/api/places/create': {
            post: {
                tags: ['Places'],
                summary: 'Create a place',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/PlaceCreate' } },
                    },
                },
                responses: {
                    '201': {
                        description: 'Place created',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/Place' } },
                        },
                    },
                },
            },
        },
        '/api/places/create-bulk': {
            post: {
                tags: ['Places'],
                summary: 'Create places in bulk',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/PlaceCreate' },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Places created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Place' },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/places/update/{id}': {
            put: {
                tags: ['Places'],
                summary: 'Update a place',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/PlaceUpdate' } },
                    },
                },
                responses: {
                    '200': { description: 'Place updated' },
                    '404': { description: 'Place not found' },
                },
            },
        },
        '/api/places/delete/{id}': {
            delete: {
                tags: ['Places'],
                summary: 'Delete a place',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Place deleted' },
                    '404': { description: 'Place not found' },
                },
            },
        },
        '/api/categories': {
            get: {
                tags: ['Categories'],
                summary: 'List categories',
                responses: {
                    '200': {
                        description: 'Categories fetched',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Category' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Categories'],
                summary: 'Create a category',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Category' } },
                    },
                },
                responses: {
                    '201': { description: 'Category created' },
                },
            },
        },
        '/api/categories/{id}': {
            put: {
                tags: ['Categories'],
                summary: 'Update a category',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Category' } },
                    },
                },
                responses: { '200': { description: 'Category updated' } },
            },
            delete: {
                tags: ['Categories'],
                summary: 'Delete a category',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Category deleted' } },
            },
        },
        '/api/cities': {
            get: {
                tags: ['Cities'],
                summary: 'List cities',
                responses: {
                    '200': {
                        description: 'Cities fetched',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/City' } },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Cities'],
                summary: 'Create a city',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/City' } },
                    },
                },
                responses: { '201': { description: 'City created' } },
            },
        },
        '/api/reviews/place/{placeId}': {
            get: {
                tags: ['Reviews'],
                summary: 'List reviews for a place',
                parameters: [
                    { name: 'placeId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': {
                        description: 'Reviews fetched',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
                            },
                        },
                    },
                },
            },
        },
        '/api/reviews': {
            post: {
                tags: ['Reviews'],
                summary: 'Create a review',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Review' } },
                    },
                },
                responses: { '201': { description: 'Review created' } },
            },
        },
        '/api/reviews/{id}': {
            put: {
                tags: ['Reviews'],
                summary: 'Update a review',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Review' } },
                    },
                },
                responses: { '200': { description: 'Review updated' } },
            },
            delete: {
                tags: ['Reviews'],
                summary: 'Delete a review',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Review deleted' } },
            },
        },
        '/api/reviews/recompute': {
            post: {
                tags: ['Reviews'],
                summary: 'Recompute ratings for all places',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Ratings recomputed' } },
            },
        },
        '/api/trips': {
            post: {
                tags: ['Trips'],
                summary: 'Create a trip',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Trip' } },
                    },
                },
                responses: { '201': { description: 'Trip created' } },
            },
            get: {
                tags: ['Trips'],
                summary: 'List trips',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Trips fetched',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Trip' } },
                            },
                        },
                    },
                },
            },
        },
        '/api/trips/{id}': {
            get: {
                tags: ['Trips'],
                summary: 'Get trip by id',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Trip fetched' } },
            },
        },
        '/api/itineraries': {
            post: {
                tags: ['Itineraries'],
                summary: 'Create itinerary',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Itinerary' } },
                    },
                },
                responses: { '201': { description: 'Itinerary created' } },
            },
            get: {
                tags: ['Itineraries'],
                summary: 'List itineraries',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Itineraries fetched',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Itinerary' } },
                            },
                        },
                    },
                },
            },
        },
        '/api/itineraries/{id}': {
            get: {
                tags: ['Itineraries'],
                summary: 'Get itinerary by id',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Itinerary fetched' } },
            },
            put: {
                tags: ['Itineraries'],
                summary: 'Update itinerary',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Itinerary' } },
                    },
                },
                responses: { '200': { description: 'Itinerary updated' } },
            },
            delete: {
                tags: ['Itineraries'],
                summary: 'Delete itinerary',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Itinerary deleted' } },
            },
        },
        '/api/itineraries/{itineraryId}/places/{placeId}/toggle': {
            patch: {
                tags: ['Itineraries'],
                summary: 'Toggle place visited',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'itineraryId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'placeId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Place toggled' } },
            },
        },
        '/api/tabs/home': {
            get: {
                tags: ['Tabs'],
                summary: 'Get home tab',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Home tab' } },
            },
        },
        '/api/tabs/explore': {
            get: {
                tags: ['Tabs'],
                summary: 'Get explore tab',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Explore tab' } },
            },
        },
        '/api/tabs/trips': {
            get: {
                tags: ['Tabs'],
                summary: 'Get trips tab',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Trips tab' } },
            },
        },
        '/api/tabs/profile': {
            get: {
                tags: ['Tabs'],
                summary: 'Get profile tab',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Profile tab' } },
            },
        },
        '/api/tabs/saved': {
            get: {
                tags: ['Tabs'],
                summary: 'Get saved tab',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Saved tab' } },
            },
        },
        '/api/ai/trips': {
            post: {
                tags: ['AI'],
                summary: 'Create trip from prompt',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AiTripRequest' } },
                    },
                },
                responses: { '200': { description: 'Trip created' } },
            },
        },
    },
};
exports.default = swaggerSpec;
