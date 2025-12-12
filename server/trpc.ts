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
 *
 * NOTE: We read cookies from the WebSocket upgrade request headers,
 * which are automatically sent by the browser (including HttpOnly cookies).
 */
export async function createWSContext(opts: {
  req: { headers: Record<string, string | string[] | undefined> };
  connectionParams?: { sessionToken?: string };
}) {
  try {
    // First try to get token from request headers (cookies are sent automatically)
    const cookieHeader = opts.req.headers.cookie;
    const cookies =
      typeof cookieHeader === "string"
        ? cookieHeader
        : Array.isArray(cookieHeader)
          ? cookieHeader[0]
          : "";

    // Parse cookie to get session token
    let sessionToken: string | undefined;

    if (cookies) {
      const match = cookies.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        try {
          sessionToken = decodeURIComponent(match[1]);
        } catch {
          sessionToken = match[1];
        }
      }
    }

    // Fallback to connectionParams if no cookie found
    if (!sessionToken && opts.connectionParams?.sessionToken) {
      sessionToken = opts.connectionParams.sessionToken;
    }

    if (!sessionToken) {
      return {
        session: null,
        user: null,
      };
    }

    // Verify session using better-auth with session token
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${encodeURIComponent(sessionToken)}`,
      }),
    });

    if (session?.user) {
      return {
        session,
        user: session.user,
      };
    }

    return {
      session: null,
      user: null,
    };
  } catch (error) {
    console.error("❌ WS Context error:", error);
    return {
      session: null,
      user: null,
    };
  }
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
