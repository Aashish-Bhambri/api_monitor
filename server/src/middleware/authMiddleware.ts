import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({
                message: "Server misconfigured"
            });
        }

        const decoded = jwt.verify(token, secret) as JwtPayload & { userId?: string };

        if (typeof decoded === "string" || !decoded.userId) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.userId = decoded.userId;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};