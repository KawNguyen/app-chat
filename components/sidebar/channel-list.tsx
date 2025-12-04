"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Settings } from "lucide-react";

interface Channel {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

interface ChannelListProps {
  serverId: string;
  serverName: string;
  categories: Category[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelList({
  serverId,
  serverName,
  categories,
  activeChannelId,
  onChannelSelect,
}: ChannelListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="text-base font-medium">{serverName}</div>
      </div>

      {/* CATEGORY + CHANNELS */}
      <div className="flex-1 overflow-y-auto py-2">
        {categories.map((cat) => (
          <div key={cat.id} className="px-3 py-2">
            {/* CATEGORY HEADER */}
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

            {/* CHANNELS */}
            {!collapsed[cat.id] && (
              <div className="mt-2 flex flex-col gap-1">
                {cat.channels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/${serverId}/${channel.id}`}
                    onClick={() => onChannelSelect(channel.id)}
                    className={`px-2 py-1 flex items-center justify-between rounded-md group text-sm transition-colors
                      ${
                        activeChannelId === channel.id
                          ? "bg-accent text-white"
                          : "text-muted-foreground hover:bg-accent/30 hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <channel.icon className="w-4 h-4" />
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
