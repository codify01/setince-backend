import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CityModel from '../models/city.model';
import CategoryModel from '../models/category.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const cities = [
  { name: 'Ibadan', state: 'Oyo', country: 'Nigeria', latitude: 7.3775, longitude: 3.947 },
  { name: 'Ogbomosho', state: 'Oyo', country: 'Nigeria', latitude: 8.133, longitude: 4.25 },
];

const categories = [
  { title: 'Museums', value: 'museums', icon: 'museum', image: '' },
  { title: 'Parks', value: 'parks', icon: 'park', image: '' },
  { title: 'Historical Sites', value: 'historical-sites', icon: 'landmark', image: '' },
  { title: 'Restaurants', value: 'restaurants', icon: 'restaurant', image: '' },
  { title: 'Cafes', value: 'cafes', icon: 'cafe', image: '' },
  { title: 'Nightlife', value: 'nightlife', icon: 'nightlife', image: '' },
  { title: 'Shopping', value: 'shopping', icon: 'shopping', image: '' },
  { title: 'Nature', value: 'nature', icon: 'nature', image: '' },
  { title: 'Family', value: 'family', icon: 'family', image: '' },
  { title: 'Beaches', value: 'beaches', icon: 'beach', image: '' },
];

const seed = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  for (const city of cities) {
    await CityModel.updateOne(
      { name: city.name },
      { $setOnInsert: city },
      { upsert: true }
    );
  }

  for (const category of categories) {
    await CategoryModel.updateOne(
      { value: category.value },
      { $setOnInsert: category },
      { upsert: true }
    );
  }

  console.log('Seeding complete');
  await mongoose.disconnect();
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
