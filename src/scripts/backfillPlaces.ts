import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PlacesModel from '../models/places.model';
import CityModel from '../models/city.model';
import CategoryModel from '../models/category.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const normalize = (value: string) => value.trim().toLowerCase();

const parseNumber = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const run = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const cities = await CityModel.find({}).select('name');
  const categories = await CategoryModel.find({}).select('title value');

  const cityMap = new Map<string, mongoose.Types.ObjectId>();
  cities.forEach((city) => {
    cityMap.set(normalize(city.name), city._id);
  });

  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  categories.forEach((category) => {
    categoryMap.set(normalize(category.title), category._id);
    categoryMap.set(normalize(category.value), category._id);
  });

  const cursor = PlacesModel.find({}).select('city cityId category categoryId location locationGeo').cursor();

  const batch: any[] = [];
  let scanned = 0;
  let updated = 0;

  for await (const place of cursor) {
    scanned += 1;
    const update: any = {};

    const ibadanId = cityMap.get('ibadan');
    if (!place.cityId && ibadanId) {
      update.cityId = ibadanId;
    }

    if (!place.categoryId && place.category) {
      const match = categoryMap.get(normalize(place.category));
      if (match) update.categoryId = match;
    }

    const lat = parseNumber(place.location?.latitude);
    const lng = parseNumber(place.location?.longitude);
    if ((!place.locationGeo || !place.locationGeo.coordinates?.length) && lat !== null && lng !== null) {
      update.locationGeo = { type: 'Point', coordinates: [lng, lat] };
    }

    if (Object.keys(update).length > 0) {
      batch.push({
        updateOne: { filter: { _id: place._id }, update },
      });
    }

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
