import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export const generateToken = (user: { id: any; username: string; email: string }) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not defined');
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return token;
};