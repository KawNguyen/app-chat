"use client";

import { useState } from "react";
import { NavUser } from "@/components/sidebar/nav-user";
import { signOut } from "@/lib/auth-client";
import { ServerList } from "./server-list";
import { ChannelList } from "./channel-list";
import { FriendList } from "./friend-list";
import { trpc } from "@/lib/trpc/react";
import { Server, UserStatus } from "@/types";

export function AppSidebar() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: servers = [] } = trpc.server.listServerJoined.useQuery() as {
    data: Server[];
  };

  const [activeServer, setActiveServer] = useState<Server | null>(
    servers[0] || null
  );
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );

  const handleServerSelect = (serverId: string | null) => {
    if (serverId === null) {
      // Zap mode - Direct Messages
      setActiveServer(null);
      setActiveChannel(null);
    } else {
      const server = servers.find((s) => s.id === serverId);
      if (server) {
        setActiveServer(server);
        setActiveChannel(null);
        setActiveConversation(null);
      }
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  return (
    <aside className="flex flex-col h-screen border-r bg-background">
      <div className="flex w-full h-full">
        <ServerList
          servers={servers}
          activeServerId={activeServer?.id || null}
          onServerSelect={handleServerSelect}
        />

        {activeServer ? (
          <ChannelList
            serverId={activeServer.id}
            serverName={activeServer.name}
            activeChannelId={activeChannel}
            onChannelSelect={handleChannelSelect}
          />
        ) : (
          <FriendList
            activeConversationId={activeConversation}
            onConversationSelect={handleConversationSelect}
          />
        )}
      </div>

      <div className="px-3 pb-3">
        {user && (
          <NavUser
            user={{
              name: user.displayName || user.username || user.email,
              email: user.email,
              image: user.image || undefined,
              status: user.status as unknown as UserStatus,
            }}
            logout={() => signOut()}
          />
        )}
      </div>
    </aside>
  );
}
