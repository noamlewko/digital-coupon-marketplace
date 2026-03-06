import axios from "axios";

/**
 * Frontend configuration is read from Vite env vars so the same code can run
 * locally and inside Docker without changing source files.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
export const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "admin-demo-token";
export const RESELLER_TOKEN = import.meta.env.VITE_RESELLER_TOKEN || "reseller-demo-token";

export const api = axios.create({
  baseURL: API_BASE
});

export function adminHeaders() {
  return { Authorization: `Bearer ${ADMIN_TOKEN}` };
}

export function resellerHeaders() {
  return { Authorization: `Bearer ${RESELLER_TOKEN}` };
}

/**
 * Backend errors follow the format:
 * { error_code, message }
 * This helper extracts the human-readable message when available.
 */
export function getErrorMessage(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const maybe = e as { response?: { data?: { message?: unknown } } };
    const msg = maybe.response?.data?.message;
    if (typeof msg === "string") return msg;
  }

  return "Request failed";
}