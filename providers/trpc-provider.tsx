"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { useState, useEffect } from "react";
import superjson from "superjson";
import { trpc } from "@/lib/trpc/react";
import { getWsClient, closeWsClient } from "@/lib/trpc/ws-client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() => {
    const wsClient = getWsClient();

    return trpc.createClient({
      links: [
        splitLink({
          condition: (op) => {
            const isSubscription = op.type === "subscription";
            if (isSubscription) {
            }
            return isSubscription;
          },
          true: wsClient
            ? wsLink({
                client: wsClient,
                transformer: superjson,
              })
            : httpBatchLink({
                url: `${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/api/trpc`,
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
  });

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      closeWsClient();
    };
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
