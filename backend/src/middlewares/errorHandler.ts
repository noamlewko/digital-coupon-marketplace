import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErrors";

/**
 * Always return errors in the required format:
 * { error_code, message }
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error_code: err.code, message: err.message });
  }

  // Fallback for unexpected errors
  console.error("Unhandled error:", err);
  return res.status(500).json({ error_code: "BAD_REQUEST", message: "Unexpected server error" });
}