import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const auth = NextAuth(authConfig).auth;

export default auth(async (req) => {
  const requestId = crypto.randomUUID();
  const start = Date.now();
  const ip = getClientIp(req as unknown as Request);
  const url = new URL(req.url || "");
  const isHealth = url.pathname.startsWith("/api/v1/health");
  const isLive = url.pathname.startsWith("/api/v1/health/live");
  const isReady = url.pathname.startsWith("/api/v1/health/ready");
  const isLogin = url.pathname === "/login";
  const isStatic = url.pathname.startsWith("/_next");

  if (isHealth || isLive || isReady || isLogin || isStatic) {
    const response = NextResponse.next();
    response.headers.set("X-Request-Id", requestId);
    response.headers.set("X-Runtime-Ms", "0");
    return response;
  }

  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return new NextResponse(
      JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-Request-Id": requestId,
        },
      }
    );
  }

  const response = NextResponse.next();
  const duration = Date.now() - start;
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Runtime-Ms", String(duration));

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
