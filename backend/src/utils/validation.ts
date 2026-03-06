import { ApiError } from "./apiErrors";

/**
 * Central request validation helpers used by the service layer.
 * Keeping these checks in one place makes error responses consistent
 * and prevents invalid input from leaking into persistence logic.
 */
export type CouponValueType = "STRING" | "IMAGE";

export function requireNonEmptyString(field: string, value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} is required`);
  }

  return value.trim();
}

export function optionalNonEmptyString(field: string, value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmptyString(field, value);
}

export function requireNonNegativeNumber(field: string, value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(num)) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a valid number`);
  }

  if (num < 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be greater than or equal to 0`);
  }

  return num;
}

export function optionalNonNegativeNumber(field: string, value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return requireNonNegativeNumber(field, value);
}

export function requireValueType(value: unknown): CouponValueType {
  if (value !== "STRING" && value !== "IMAGE") {
    throw new ApiError(400, "BAD_REQUEST", "value_type must be STRING or IMAGE");
  }

  return value;
}

export function optionalValueType(value: unknown): CouponValueType | undefined {
  if (value === undefined) return undefined;
  return requireValueType(value);
}

export function requireUrl(field: string, value: unknown): string {
  const url = requireNonEmptyString(field, value);

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }

    return parsed.toString();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a valid http/https URL`);
  }
}

export function optionalUrl(field: string, value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return requireUrl(field, value);
}