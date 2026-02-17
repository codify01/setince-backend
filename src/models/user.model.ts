import mongoose from 'mongoose';

export interface User {
    _id?: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
	username: string;
	email: string;
	password: string;
	role?: string;
	isActive?: boolean;
	lastLogin?: Date;
	profilePicture?: string;
	bio?: string;
	preferences?: {
		theme?: string;
		language?: string;
		notifications?: boolean;
	};
	createdAt?: Date;
	updatedAt?: Date;
}


const userSchema = new mongoose.Schema<User>({
    firstName: { type: String, required: true, lowercase: true, trim: true },
    lastName: { type: String, required: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'seller', 'super_admin'], default: 'user' },
    isActive: { type: Boolean, default: false },
    lastLogin: { type: Date },
    profilePicture: { type: String },   
    bio: { type: String },
    preferences: {
        theme: { type: String, default: 'light' },
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
