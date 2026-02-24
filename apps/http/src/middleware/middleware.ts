import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
    userId: string,
}

declare global {
    namespace Express {
        export interface Request {
            userId: string;
        }
    }
}

export async function middleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies["jwt-sanchitra"];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized user" });
            return;
        }
        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET) as JwtPayload;
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in middleware", error: error });
    }
}