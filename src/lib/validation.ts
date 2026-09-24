const RESERVED = new Set([
  "dashboard",
  "login",
  "signup",
  "logout",
  "auth",
  "obs",
  "u",
  "api",
  "admin",
  "store",
  "support",
  "help",
  "terms",
  "privacy",
  "settings",
  "account",
  "assets",
  "favicon.ico",
]);

export function normalizeHandle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "")
    .slice(0, 24);
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48);
}

export function validHandle(value: string) {
  return /^[a-z0-9][a-z0-9_-]{2,23}$/.test(value) && !RESERVED.has(value);
}

export function validSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]{2,47}$/.test(value) && !RESERVED.has(value);
}

export function validHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
