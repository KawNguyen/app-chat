"use client";

import { useState } from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import { signOut, useSession } from "@/lib/auth-client";
import { servers } from "@/constants";
import { ServerList } from "./server-list";
import { ChannelList } from "./channel-list";

export function AppSidebar() {
  const { data: user } = useSession();

  const [activeServer, setActiveServer] = useState(servers[0]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const handleServerSelect = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (server) {
      setActiveServer(server);
      setActiveChannel(null);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
  };

  return (
    <aside className="flex flex-col h-screen border-r bg-background">
      <div className="flex w-full h-full">
        <ServerList
          activeServerId={activeServer.id}
          onServerSelect={handleServerSelect}
        />

        <ChannelList
          serverId={activeServer.id}
          serverName={activeServer.name}
          categories={activeServer.categories}
          activeChannelId={activeChannel}
          onChannelSelect={handleChannelSelect}
        />
      </div>

      <div className="px-3 pb-3">
        <NavUser
          user={{
            name: user?.user.name || "User",
            email: user?.user.email || "user@example.com",
            image: user?.user.image ?? undefined,
          }}
          logout={() => signOut()}
        />
      </div>
    </aside>
  );
}
