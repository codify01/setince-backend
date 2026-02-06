import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PlacesModel from '../models/places.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const parseNumber = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const run = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const cursor = PlacesModel.find({
    $or: [
      { locationGeo: { $exists: false } },
      { 'locationGeo.coordinates': { $size: 0 } },
    ],
    'location.latitude': { $exists: true },
    'location.longitude': { $exists: true },
  })
    .select('location locationGeo')
    .cursor();

  const batch: any[] = [];
  let scanned = 0;
  let updated = 0;

  for await (const place of cursor) {
    scanned += 1;
    const lat = parseNumber(place.location?.latitude);
    const lng = parseNumber(place.location?.longitude);
    if (lat === null || lng === null) continue;

    batch.push({
      updateOne: {
        filter: { _id: place._id },
        update: { locationGeo: { type: 'Point', coordinates: [lng, lat] } },
      },
    });

    if (batch.length >= 500) {
      const result = await PlacesModel.bulkWrite(batch);
      updated += result.modifiedCount || 0;
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const result = await PlacesModel.bulkWrite(batch);
    updated += result.modifiedCount || 0;
  }

  console.log(`Scanned: ${scanned}, Updated: ${updated}`);
  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });
