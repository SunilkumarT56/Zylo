import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log("auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ status: false, error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      res
        .status(500)
        .json({ status: false, error: "Server configuration error" });
      return;
    }
    //@ts-ignore
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ status: false, error: "Invalid token" });
  }
};
