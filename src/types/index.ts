import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      roleLevel: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    roleLevel: number;
  }
}
