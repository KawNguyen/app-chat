"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Settings, Volume2, Hash } from "lucide-react";
import { trpc } from "@/lib/trpc/react";
import { ChannelType, Server } from "@/types";
import { InviteDialog } from "./invite-dialog";
import { ServerSettingsMenu } from "./server-settings";

interface ChannelListProps {
  serverId: string;
  serverName: string;
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelList({
  serverId,
  serverName,
  activeChannelId,
  onChannelSelect,
}: ChannelListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { data: server } = trpc.server.getServerById.useQuery({
    serverId,
  }) as { data: Server | undefined };

  const { data: currentUser } = trpc.user.me.useQuery();
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
        {server?.categories?.map((cat) => (
          <div key={cat.id} className="px-3 py-2">
            <button
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [cat.id]: !prev[cat.id],
                }))
              }
              className="w-full flex justify-between items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="uppercase">{cat.name}</span>
              <span>{collapsed[cat.id] ? "+" : "−"}</span>
            </button>

            {!collapsed[cat.id] && (
              <div className="mt-2 flex flex-col gap-1">
                {cat.channels?.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/channels/${serverId}/${channel.id}`}
                    onClick={() => onChannelSelect(channel.id)}
                    className={`px-2 py-1 flex items-center justify-between rounded-md group text-sm transition-colors
                      ${
                        activeChannelId === channel.id
                          ? "bg-accent text-white"
                          : "text-muted-foreground hover:bg-accent/30 hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {channel.type === ChannelType.TEXT ? (
                        <Hash className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                      )}
                      {channel.name}
                    </div>

                    {activeChannelId === channel.id && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <Settings className="w-4 h-4" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
