import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";

interface JwtPayload {
  id: string;
}

type Role = 'user' | 'admin' | 'seller' | 'super_admin';

export const protect = async (req, res, next: NextFunction) => {
  let token;

  try {
    // Expect token in Authorization header as "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // Attach user to request (excluding password field)
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req, res, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');
