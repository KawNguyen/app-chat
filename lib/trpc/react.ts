import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/**
 * React hooks for tRPC
 */
export const trpc = createTRPCReact<AppRouter>();
