import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: "user" | "admin";
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      message: authHeader ? "Invalid authentication token" : "Authentication required",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "JWT_SECRET is not configured",
    });
    return;
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string"
    ) {
      res.status(401).json({
        message: "Invalid or expired token",
      });
      return;
    }
    userId = decoded.userId;
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
    return;
  }

  try {
    const user = await User.findById(userId).select("_id role");
    if (!user) {
      res.status(401).json({
        message: "Invalid or expired token",
      });
      return;
    }

    req.userId = user._id.toString();
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error("Authentication lookup failed:", error);
    res.status(500).json({
      message: "Unable to authenticate request",
    });
  }
};

export default authMiddleware;