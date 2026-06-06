import type { NextAuthConfig } from "next-auth";

const roleHierarchy: Record<string, number> = {
  ADMIN: 100,
  COORDENADOR_GERAL: 80,
  COORDENADOR_REGIONAL: 60,
  COORDENADOR_MUNICIPAL: 40,
  LIDERANCA: 20,
  OPERADOR: 10,
};

type RouteEntry = { path: string; minLevel: number; methods?: string[] };

const protectedRoutes: RouteEntry[] = [
  { path: "/api/v1/intelligence/refresh", minLevel: 80 },
  { path: "/api/v1/people", minLevel: 10 },
  { path: "/api/v1/people/", minLevel: 10 },
  { path: "/api/v1/leaderships", minLevel: 20 },
  { path: "/api/v1/leaderships/", minLevel: 20 },
  { path: "/api/v1/demands", minLevel: 10 },
  { path: "/api/v1/demands/", minLevel: 10 },
  { path: "/api/v1/activities", minLevel: 20 },
  { path: "/api/v1/activities/", minLevel: 20 },
  { path: "/api/v1/events", minLevel: 20 },
  { path: "/api/v1/events/", minLevel: 20 },
  { path: "/api/v1/surveys", minLevel: 20 },
  { path: "/api/v1/surveys/", minLevel: 20 },
  { path: "/api/v1/territories", minLevel: 10 },
  { path: "/api/v1/territories/", minLevel: 10 },
  { path: "/api/v1/war-room", minLevel: 10 },
  { path: "/api/v1/intelligence", minLevel: 10 },
  { path: "/api/v1/notifications", minLevel: 10 },
  { path: "/api/v1/notifications/", minLevel: 10 },
  { path: "/api/v1/message-templates", minLevel: 60 },
  { path: "/api/v1/message-templates/", minLevel: 60 },
  { path: "/api/v1/message-queue", minLevel: 60 },
  { path: "/api/v1/ai", minLevel: 20 },
  { path: "/api/v1/ai/", minLevel: 20 },
  { path: "/api/v1/backup", minLevel: 100 },
  { path: "/api/v1/export", minLevel: 20 },
  { path: "/api/v1/import", minLevel: 60 },
  { path: "/admin", minLevel: 100 },
  { path: "/admin/", minLevel: 100 },
];

function getMinLevelForPath(pathname: string): number | null {
  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path)) {
      return route.minLevel;
    }
  }
  return null;
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isLoginPage = nextUrl.pathname === "/login";
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isHealth = nextUrl.pathname.startsWith("/api/v1/health");

      if (isHealth) return true;

      if (!isLoggedIn && !isLoginPage && !isApiAuth) return false;
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname.startsWith("/api/v1/")) {
        const user = session.user as { roleLevel?: number; role?: string } | undefined;
        const userLevel = user?.roleLevel ?? 0;
        const requiredLevel = getMinLevelForPath(nextUrl.pathname);
        if (requiredLevel !== null && userLevel < requiredLevel) {
          return Response.json({ error: "Permissão insuficiente" }, { status: 403 });
        }
      }

      if (isLoggedIn && nextUrl.pathname.startsWith("/api/v1/")) {
        const method = nextUrl.searchParams.get("_method") || "GET";
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          const csrfToken = nextUrl.searchParams.get("_csrf");
          const user = session.user as { id?: string };
          if (!csrfToken && user?.id) {
            return Response.json({ error: "CSRF token requerido" }, { status: 403 });
          }
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
