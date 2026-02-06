# Frontend Integration Guide (Setince Backend)

This document is the single source of truth for frontend developers integrating with the Setince backend.

## Base URL

```
http://<host>:<port>/api
```

## Authentication

Most endpoints use Bearer tokens.

```
Authorization: Bearer <JWT>
```

If a route is protected and the header is missing/invalid, you will receive `401`.

**Login flow**
1. Call `POST /auth/login`.
2. Store the returned JWT (e.g., in secure storage).
3. Attach JWT on all protected routes.

**Protected routes**
- `/users/profile`
- `/itineraries/*`
- `/trips/*`
- `POST /categories`
- `POST /cities`
- `POST /reviews`
- `PUT /reviews/:id`
- `DELETE /reviews/:id`
- `POST /reviews/recompute` (admin only)

## Response Shape

Most endpoints use a common shape:

```json
{
  "success": true,
  "message": "Some message",
  "data": {}
}
```

Some tab endpoints return raw data (no wrapper).

## Required Client Inputs (App Must Provide)

To enable accurate recommendations and itineraries:

- **GPS coordinates**:
  - Send `lat` and `lng` to tab endpoints (`/tabs/home`, `/tabs/explore`).
  - Used for Mapbox travel time and nearby recommendations.
- **City selection**:
  - Trip creation requires `cities` (IDs from `/cities`).
- **Place selection (optional)**:
  - If user selects specific places, send `selectedPlaces`.
- **User preferences**:
  - Send `pace`, `interests`, and preferred day hours for better scheduling.

## Mapbox Travel Time

Backend uses Mapbox Matrix API to compute real travel time.
- Requires server env var: `MAPBOX_ACCESS_TOKEN`
- Frontend does **not** call Mapbox directly.
- Provide GPS to enable travel-time scoring.

## Tabs (Core UI Data)

### Home Tab
`GET /tabs/home`

Optional query params for GPS:
```
?lat=6.45&lng=3.39
```

Response (raw JSON):
```json
{
  "user": { "_id": "string", "firstName": "string" },
  "categories": [
    { "id": "string", "title": "string", "image": "string" }
  ],
  "trending": [
    { "id": "string", "name": "string", "image": "string" }
  ],
  "recommendedPlaces": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "rating": 4.5,
      "images": ["string"]
    }
  ],
  "nearbyPlaces": [
    { "id": "string", "name": "string", "distance": "12 min", "image": "string", "rating": 4.8 }
  ],
  "recentTrips": [
    { "id": "string", "name": "string", "date": "YYYY-MM-DD", "image": "string" }
  ]
}
```

### Explore Tab
`GET /tabs/explore`

Optional query params for GPS:
```
?lat=6.45&lng=3.39
```

Response (raw JSON):
```json
{
  "categories": [
    { "name": "string", "icon": "string", "value": "string" }
  ],
  "trending": [
    {
      "id": "string",
      "name": "string",
      "cuisine": "string",
      "distance": "12 min",
      "rating": 4.8,
      "reviews": 120,
      "image": "string"
    }
  ],
  "places": [
    { "_id": "string", "name": "string", "address": "string", "images": ["string"] }
  ]
}
```

### Trips Tab
`GET /tabs/trips`

Response (raw JSON):
```json
{
  "trips": [
    {
      "id": "string",
      "name": "string",
      "destination": "string",
      "duration": "3 days",
      "travelers": 1,
      "image": "string",
      "placesCount": 2
    }
  ]
}
```

### Profile Tab
`GET /tabs/profile`

Response (raw JSON):
```json
{
  "user": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "avatar": "string"
  },
  "activity": { "tripsCreated": 12, "placesVisited": 28, "favorites": 7 }
}
```

### Saved Tab
`GET /tabs/saved`

Response (raw JSON):
```json
{ "items": [] }
```

## Auth

### Register
`POST /auth/register`

### Login
`POST /auth/login`

Login returns a JWT token used in the `Authorization` header.

Expected response (example):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT",
    "user": { "_id": "string", "firstName": "string", "lastName": "string" }
  }
}
```

## Users

### Profile
`GET /users/profile`

Protected.

## Places

### List places
`GET /places`

### Get place by id
`GET /places/:id`

### Search
`GET /places/search?query=beach`

Optional:
```
?approved=true
```

### Create place
`POST /places/create`

Required fields (minimum):
```
name, description, address, images, contactInfo
```

Recommended fields for best UX:
```
cityId, categoryId, location.latitude, location.longitude, openingHoursWeekly
```

`openingHoursWeekly` format:
```json
[
  { "day": 1, "open": "09:00", "close": "17:00" },
  { "day": 2, "open": "09:00", "close": "17:00" }
]
```

### Bulk create
`POST /places/create-bulk`

## Categories

### List categories
`GET /categories`

### Create category
`POST /categories`

Protected.

## Cities

### List cities
`GET /cities`

### Create city
`POST /cities`

Protected.

## Trips

### Create trip (generates itinerary)
`POST /trips`

Protected.

Example body:
```json
{
  "title": "Weekend in Lagos",
  "description": "Short getaway",
  "cities": [{ "cityId": "CITY_ID", "name": "Lagos" }],
  "startDate": "2026-02-10",
  "endDate": "2026-02-12",
  "preferences": {
    "pace": "normal",
    "interests": ["museums", "food"],
    "allowSameDayCityTravel": false,
    "preferredStartHour": 9,
    "preferredEndHour": 18
  },
  "selectedPlaces": ["PLACE_ID_1", "PLACE_ID_2"]
}
```

Notes:
- If `selectedPlaces` is empty, the backend picks top places by rating.
- If trip days < number of cities, some cities are skipped and a warning is returned.
- If `allowSameDayCityTravel=false`, travel days are inserted when possible.

### List trips
`GET /trips`

### Trip details
`GET /trips/:id`

Trip response includes:
```
trip.itinerary.days[] with blocks (activity/travel/free_time)
```

## Itineraries

### Create itinerary
`POST /itineraries`

### List itineraries
`GET /itineraries`

### Get itinerary by id
`GET /itineraries/:id`

## Reviews

### Create review
`POST /reviews`

Protected.

Body:
```json
{ "placeId": "PLACE_ID", "rating": 5, "comment": "Great!", "images": [] }
```

### List reviews for place
`GET /reviews/place/:placeId`

### Update review
`PUT /reviews/:id`

### Delete review
`DELETE /reviews/:id`

### Recompute ratings (admin only)
`POST /reviews/recompute`

## Ratings & Reviews Behavior

- Places store cached rating summary:
  - `places.ratings.averageRating`
  - `places.ratings.numberOfRatings`
- These values update when reviews are created/updated/deleted.
- Frontend should display `rating` and `reviews` as above.

## Location & Distance Notes

For best recommendations, send GPS coordinates to tab endpoints:
```
GET /tabs/home?lat=<lat>&lng=<lng>
GET /tabs/explore?lat=<lat>&lng=<lng>
```

When available, travel time is calculated using Mapbox Matrix.

**Distance display behavior**
- If Mapbox travel time is available, `distance` contains travel time (e.g., `12 min`).
- If not, it falls back to straight‑line distance (e.g., `3.4 km`).

## Environment Variables (Frontend Relevant)

```
MAPBOX_ACCESS_TOKEN=<token>
```

## Common Status Codes

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Server Error

## Common Error Handling

The API may return:
```json
{ "success": false, "message": "Error message", "error": "details" }
```

Frontend should:
- Show `message` to users
- Log `error` (if present) for debugging

## Recommended Frontend Implementation Checklist

- Store JWT securely and refresh if expired
- Send `lat/lng` whenever available
- Keep city and category lists cached locally
- Handle empty arrays gracefully (e.g., no nearbyPlaces)
- Use `distance` as a display string, not numeric
