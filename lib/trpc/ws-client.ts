import { createWSClient, wsLink } from "@trpc/client";
import { createTRPCClient, httpBatchLink, splitLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import superjson from "superjson";

/**
 * WebSocket client singleton for subscriptions
 */
let _wsClient: ReturnType<typeof createWSClient> | null = null;

export function getWsClient() {
  if (typeof window === "undefined") return null;

  if (!_wsClient) {
    _wsClient = createWSClient({
      url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    });
  }

  return _wsClient;
}

/**
 * Manually close and reset the WebSocket client
 */
export function closeWsClient() {
  if (_wsClient) {
    _wsClient.close();
    _wsClient = null;
  }
}

/**
 * tRPC client with WebSocket support
 */
export const trpcClientBrowser = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: wsLink({
        client: getWsClient()!, // dùng singleton
        transformer: superjson,
      }),
      false: httpBatchLink({
        url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/trpc`,
        transformer: superjson,
      }),
    }),
  ],
});
