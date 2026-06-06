import { prisma } from "@/lib/prisma";

export async function GET() {
  let ready = true;
  let dbStatus = "ok";
  let checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    ready = false;
    dbStatus = "error";
    checks.database = "error";
  }

  return new Response(
    JSON.stringify({
      status: ready ? "ready" : "not_ready",
      checks,
      timestamp: new Date().toISOString(),
    }),
    {
      status: ready ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
