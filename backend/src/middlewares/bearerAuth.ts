import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErrors";

/**
 * Generic Bearer token auth middleware.
 * We will use it for:
 * - reseller routes (RESELLER_TOKEN)
 * - admin routes (ADMIN_TOKEN)
 */
export function bearerAuth(expectedTokenEnvKey: "RESELLER_TOKEN" | "ADMIN_TOKEN") {
  return (req: Request, _res: Response, next: NextFunction) => {
    
    const auth = req.header("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
    const expected = process.env[expectedTokenEnvKey];
    console.log("Auth header:", JSON.stringify(req.header("Authorization")));
    console.log("Expected token:", expectedTokenEnvKey, JSON.stringify(expected));
    console.log("Received token:", JSON.stringify(token));
    if (!expected || !token || token !== expected) {
      return next(new ApiError(401, "UNAUTHORIZED", "Missing or invalid bearer token"));
    }

    next();
  };
}