import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import superjson from "superjson";
import { headers } from "next/headers";

/**
 * Create context for tRPC (HTTP requests - Next.js API routes)
 */
export async function createContext() {
  const headersList = await headers();

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return {
      session,
      user: session?.user || null,
    };
  } catch {
    return {
      session: null,
      user: null,
    };
  }
}

/**
 * Create context for WebSocket connections
 * WebSocket doesn't have access to Next.js headers()
 */
export async function createWSContext() {
  // WebSocket connections are public for now
  // Authentication can be handled via token in connection params if needed
  return {
    session: null,
    user: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialize tRPC instance
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export helpers to create routers and procedures
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires user to be authenticated
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});
