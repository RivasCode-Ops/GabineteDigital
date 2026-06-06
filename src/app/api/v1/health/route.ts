import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  let dbStatus = "ok";
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: unknown) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Database connection failed";
  }

  return new Response(
    JSON.stringify({
      status: dbStatus === "ok" ? "ok" : "degraded",
      version: process.env.npm_package_version || "v0.2.0-beta",
      database: dbStatus,
      databaseError: dbError,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: Date.now() - start,
    }),
    {
      status: dbStatus === "ok" ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
