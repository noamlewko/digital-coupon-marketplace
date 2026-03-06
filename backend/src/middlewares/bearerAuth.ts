import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErrors";

export function bearerAuth(expectedTokenEnvKey: "RESELLER_TOKEN" | "ADMIN_TOKEN") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.header("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
    const expected = process.env[expectedTokenEnvKey];

    if (!expected || !token || token !== expected) {
      return next(new ApiError(401, "UNAUTHORIZED", "Missing or invalid bearer token"));
    }

    next();
  };
}