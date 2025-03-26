// Option 1: rate-limit.ts (or rate-limit.server.ts, see below)
import { data } from "react-router";

export function applyRateLimit({
  request,
  windowMs = 15 * 60 * 1000, // 15-minute default
  maxRequests = 20, // 30 requests default
  store = new Map<string, number[]>(), // In-memory store
}: {
  request: Request;
  windowMs?: number;
  maxRequests?: number;
  store?: Map<string, number[]>;
}) {
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  let timestamps = store.get(clientIp) || [];
  timestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (timestamps.length >= maxRequests) {
    return data(
      { error: "Too many requests, try again later" },
      { status: 429 }
    );
  }

  timestamps.push(now);
  store.set(clientIp, timestamps);
  return null; // No rate limit exceeded
}
