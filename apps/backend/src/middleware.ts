import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      message: "Authorization token is missing",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as { id: string };

    req.id = payload.id;

    next();
  } catch (error: any) {
    console.error("Auth Error:", error);

    res.status(403).json({
      message: "Invalid or expired token",
    });
  }
}
