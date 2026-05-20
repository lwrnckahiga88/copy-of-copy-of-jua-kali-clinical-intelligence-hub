import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  // MOCK FOR DEMO: If no user is authenticated, provide a mock enterprise user
  if (!user) {
    user = {
      id: 999,
      openId: "demo-user",
      name: "Demo User",
      email: "demo@juakali.hub",
      loginMethod: "mock",
      role: "admin",
      plan: "enterprise",
      lastSignedIn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  } else {
    // Ensure authenticated user also has enterprise plan for demo
    user.plan = "enterprise";
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
