"use client";

import Link from "next/link";
import { Users, Settings, Volume2, Hash } from "lucide-react";
import { ChannelType } from "@/types";
import { setLastChannelForServer } from "@/lib/utils/server-cache";

interface Category {
  id: string;
  name: string;
  channels?: Array<{
    id: string;
    name: string;
    type: ChannelType;
  }>;
}

interface CategoryChannelsProps {
  categories: Category[];
  serverId: string;
  activeChannelId: string | null;
  channelId: string | null;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onChannelSelect: (channelId: string) => void;
}

function CategoryChannels({
  categories,
  serverId,
  activeChannelId,
  channelId,
  collapsed,
  setCollapsed,
  onChannelSelect,
}: CategoryChannelsProps) {
  return (
    <>
      {categories.map((cat) => (
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
                  onClick={() => {
                    onChannelSelect(channel.id);
                    setLastChannelForServer(serverId, channel.id);
                  }}
                  className={`px-2 py-1 flex items-center justify-between rounded-md group text-sm transition-colors
                    ${
                      channelId === channel.id || activeChannelId === channel.id
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
    </>
  );
}

export default CategoryChannels;
