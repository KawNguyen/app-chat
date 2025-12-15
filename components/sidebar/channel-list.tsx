"use client";

import { useState, Suspense, lazy } from "react";
import { trpc } from "@/lib/trpc/react";
import { Server, User } from "@/types";
import { InviteDialog } from "./invite-dialog";
import { ServerSettingsMenu } from "./server-settings";
import { Skeleton } from "../ui/skeleton";
import { getLastChannelForServer } from "@/lib/utils/server-cache";

const CategoryChannels = lazy(() => import("./channel-list-categories"));

interface ChannelListProps {
  serverId: string;
  serverName: string;
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
}

function ChannelListContent({
  serverId,
  serverName,
  activeChannelId,
  onChannelSelect,
}: ChannelListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { data: server } = trpc.server.getServerById.useQuery(
    {
      serverId,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      suspense: true,
    },
  ) as { data: Server };
  console.log(server);

  const channelId =
    getLastChannelForServer(serverId) ||
    server?.categories.find((t) => t.name === "TEXT CHANNELS")?.channels?.[0]
      ?.id ||
    null;

  const { data: currentUser } = trpc.user.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    suspense: true,
  }) as { data: User };
  const isOwner = server?.ownerId === currentUser?.id;

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="border-b p-3 flex items-center justify-between gap-2">
        <ServerSettingsMenu
          serverId={serverId}
          serverName={serverName}
          isOwner={isOwner}
        />
        <InviteDialog serverId={serverId} serverName={serverName} />
      </div>

      {/* CATEGORY + CHANNELS */}
      <div className="flex-1 overflow-y-auto py-2">
        <Suspense fallback={<CategoryChannelsSkeleton />}>
          <CategoryChannels
            categories={server?.categories || []}
            serverId={serverId}
            activeChannelId={activeChannelId}
            channelId={channelId}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onChannelSelect={onChannelSelect}
          />
        </Suspense>
      </div>
    </div>
  );
}

function CategoryChannelsSkeleton() {
  return (
    <div className="px-3 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

function ChannelListSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-3">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelList(props: ChannelListProps) {
  return (
    <Suspense fallback={<ChannelListSkeleton />}>
      <ChannelListContent {...props} />
    </Suspense>
  );
}
