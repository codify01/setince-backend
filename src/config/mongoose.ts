import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const MONGO_URI = process.env.MONGO_URI;

export const mongooseConfig = async (): Promise<void> => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('MongoDB connected successfully');
	} catch (error) {
		console.error('Error connecting to MongoDB:', error)
	}
};
