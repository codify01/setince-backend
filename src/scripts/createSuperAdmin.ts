import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const SUPER_ADMIN = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
};

const run = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is not set');
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const existing = await UserModel.findOne({
    $or: [{ email: SUPER_ADMIN.email }, { username: SUPER_ADMIN.username }],
  });

  const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, 12);

  if (existing) {
    existing.firstName = SUPER_ADMIN.firstName;
    existing.lastName = SUPER_ADMIN.lastName;
    existing.username = SUPER_ADMIN.username;
    existing.email = SUPER_ADMIN.email;
    existing.password = hashedPassword;
    existing.role = 'super_admin';
    existing.isActive = true;
    await existing.save();

    console.log('Super admin updated:', existing.email);
  } else {
    const created = await UserModel.create({
      ...SUPER_ADMIN,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    });
    console.log('Super admin created:', created.email);
  }

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Create super admin failed:', error);
    process.exit(1);
  });
