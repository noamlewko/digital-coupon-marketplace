import axios from "axios";

/**
 * Frontend API helpers.
 * Admin and reseller tokens are entered once in the UI and stored in localStorage,
 * so they are not embedded in the frontend bundle.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const ADMIN_TOKEN_KEY = "coupon-marketplace-admin-token";
const RESELLER_TOKEN_KEY = "coupon-marketplace-reseller-token";

export const api = axios.create({
  baseURL: API_BASE
});

function readToken(key: string) {
  return window.localStorage.getItem(key) || "";
}

function writeToken(key: string, token: string) {
  if (token.trim().length === 0) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, token.trim());
}

export function getAdminToken() {
  return readToken(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  writeToken(ADMIN_TOKEN_KEY, token);
}

export function getResellerToken() {
  return readToken(RESELLER_TOKEN_KEY);
}

export function setResellerToken(token: string) {
  writeToken(RESELLER_TOKEN_KEY, token);
}

export function adminHeaders(token?: string) {
  const current = (token ?? getAdminToken()).trim();
  return current ? { Authorization: `Bearer ${current}` } : {};
}

export function resellerHeaders(token?: string) {
  const current = (token ?? getResellerToken()).trim();
  return current ? { Authorization: `Bearer ${current}` } : {};
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