import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.userRole !== "admin") {
    res.status(403).json({
      message: "Administrator access required",
    });
    return;
  }

  next();
};

export default requireAdmin;
