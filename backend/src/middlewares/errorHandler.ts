import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErrors";

/**
 * Normalizes all thrown errors into the assignment's required API format:
 * { error_code, message }
 */
function extractMongooseValidationMessage(err: mongoose.Error.ValidationError) {
  const first = Object.values(err.errors)[0];
  return first?.message || "Invalid request body";
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error_code: err.code, message: err.message });
  }

  // Convert model-level validation failures into clean client-facing 400 errors.
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error_code: "BAD_REQUEST",
      message: extractMongooseValidationMessage(err)
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error_code: "BAD_REQUEST",
      message: "Invalid request data"
    });
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