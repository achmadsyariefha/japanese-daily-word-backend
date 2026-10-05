import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Missing or Invalid Authorization header" });
    }
    try {
        const payload = verifyToken(header.slice(7));
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};