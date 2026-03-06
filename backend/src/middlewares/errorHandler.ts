import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErrors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error_code: err.code, message: err.message });
  }

  if (err instanceof Error) {
    console.error("Unhandled error:", err.message);
    return res.status(500).json({
      error_code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error"
    });
  }

  return res.status(500).json({
    error_code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected server error"
  });
}