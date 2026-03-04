/**
 * Centralized API error format as required:
 * { "error_code": "...", "message": "..." }
 */

export type ApiErrorCode =
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_ALREADY_SOLD"
  | "RESELLER_PRICE_TOO_LOW"
  | "UNAUTHORIZED"
  | "BAD_REQUEST";

export class ApiError extends Error {
  public status: number;
  public code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}