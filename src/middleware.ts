import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const auth = NextAuth(authConfig).auth;

export default auth(async (req) => {
  const ip = getClientIp(req as unknown as Request);
  const rl = rateLimit(ip);

  if (!rl.allowed) {
    return new NextResponse(
      JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(rl.remaining));
  response.headers.set("X-RateLimit-Reset", String(rl.resetAt));

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login).*)",
  ],
};
