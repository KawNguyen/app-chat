"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavUser } from "@/components/sidebar/nav-user";
import { signOut } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/react";
import { Server, User } from "@/types";
import FriendList from "../direct-chat/components/friend-list";
import { ServerList } from "./server-list";
import { ChannelList } from "./channel-list";
import { useCurrentUser } from "@/providers/user-provider";

function SidebarContent() {
  const params = useParams();
  const serverIdFromUrl = params?.serverId as string | undefined;
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: servers = [] } = trpc.server.listServerJoined.useQuery(
    undefined,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  ) as {
    data: Server[];
  };

  const activeServer = serverIdFromUrl
    ? servers.find((s) => s.id === serverIdFromUrl) || null
    : null;

  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );

  const handleServerSelect = (serverId: string | null) => {
    if (serverId === null) {
      setActiveChannel(null);
    } else {
      setActiveChannel(null);
      setActiveConversation(null);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
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
        <NavUser
          user={user}
          hasPassword={(user as User & { hasPassword: boolean })?.hasPassword}
          logout={handleLogout}
        />
      </div>
    </aside>
  );
}

export function AppSidebar() {
  return <SidebarContent />;
}
