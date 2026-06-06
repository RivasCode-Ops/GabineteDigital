import { randomBytes } from "crypto";

const tokens = new Map<string, { token: string; expiresAt: number }>();

const TOKEN_EXPIRY = 60 * 60 * 1000;
const CLEANUP_INTERVAL = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokens) {
    if (now > value.expiresAt) tokens.delete(key);
  }
}, CLEANUP_INTERVAL);

export function generateCsrfToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex");
  tokens.set(sessionId, { token, expiresAt: Date.now() + TOKEN_EXPIRY });
  return token;
}

export function validateCsrfToken(sessionId: string, token: string): boolean {
  const record = tokens.get(sessionId);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    tokens.delete(sessionId);
    return false;
  }
  return record.token === token;
}

export function sanitizeInput(value: string): string {
  return value
    .replace(/[<>"'&]/g, (char) => {
      const map: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return map[char] || char;
    })
    .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
