import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import superjson from "superjson";

/**
 * Vanilla tRPC client - use for server-side or non-React code
 */
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/trpc`,
      transformer: superjson,
    }),
  ],
});
