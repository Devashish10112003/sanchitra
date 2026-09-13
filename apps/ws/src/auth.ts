import jwt from "jsonwebtoken";
import type { IncomingMessage } from "http";
import { ENV_VARS } from "./config/envVars";

interface JwtPayload {
    userId: string;
}

function readCookie(header: string | undefined, name: string): string | undefined {
    if (!header) return undefined;

    for (const part of header.split(";")) {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = part.slice(0, separatorIndex).trim();
        if (key === name) return part.slice(separatorIndex + 1).trim();
    }

    return undefined;
}

export function authenticateRequest(request: IncomingMessage): string | null {
    const token = readCookie(request.headers.cookie, "jwt-sanchitra");
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET) as JwtPayload;
        return decoded.userId;
    } catch {
        return null;
    }
}
