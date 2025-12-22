"use client";

import { useState, Suspense, lazy, useEffect } from "react";
import Link from "next/link";
import { Users, ShoppingBag, HelpCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStatus } from "@/providers/user-status-provider";
import { User, UserStatus } from "@/types";

const DirectMessagesList = lazy(
  () => import("@/components/direct-chat/direct-messages-list")
);

export interface Conversation {
  id: string;
  otherUser: User;
  lastMessage?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    conversationId: string;
    content: string;
    senderId: string;
    isEdited: boolean;
  };
  updatedAt: Date;
  unreadCount?: number;
  lastReadAt?: Date | null;
}

interface FriendListProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

function FriendList({
  activeConversationId,
  onConversationSelect,
}: FriendListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { setMultipleStatuses, getUserStatus } = useUserStatus();

  const { data: conversations = [] } =
    trpc.conversation.listConversations.useQuery(undefined, {
      staleTime: 60 * 1000, // 1 minute
    }) as { data: Conversation[] };
  const { data: friends = [] } = trpc.friend.listFriends.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Initialize global status cho friends
  useEffect(() => {
    if (friends && friends.length > 0) {
      const statuses = (friends as User[]).map((f) => ({
        userId: f.id,
        status: f.status as UserStatus,
      }));
      setMultipleStatuses(statuses);
    }
  }, [friends, setMultipleStatuses]);

  // Get frequent friends với status từ global provider
  const frequentFriends = ((friends as User[])?.slice(0, 5) || []).map(
    (friend) => ({
      ...friend,
      status: getUserStatus(friend.id) || friend.status,
    })
  );

  return (
    <div className="flex-1 flex flex-col gap-2">
      {/* SEARCH */}
      <div className="p-3 border-b">
        <Input
          placeholder="Find or start a conversation"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#1e1f22] border-none h-8 text-sm"
        />
      </div>

      {/* NAVIGATION MENU */}
      <div className="px-2 space-y-0.5">
        <Link
          href="/channels/me"
          className="flex items-center gap-3 px-2 py-1.5 rounded h border-bover:bg-[#404249] text-[#b5bac1] hover:text-white transition-colors"
        >
          <Users className="h-5 w-5" />
          <span className="font-medium text-sm">Friends</span>
        </Link>

        <Link
          href="/nitro"
          className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#404249] text-[#b5bac1] hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.8 7.4l-8.8-6-8.8 6v9.2l8.8 6 8.8-6V7.4z" />
          </svg>
          <span className="font-medium text-sm">Nitro</span>
        </Link>

        <Link
          href="/shop"
          className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#404249] text-[#b5bac1] hover:text-white transition-colors"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-medium text-sm">Shop</span>
        </Link>

        <Link
          href="/quests"
          className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#404249] text-[#b5bac1] hover:text-white transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="font-medium text-sm">Quests</span>
        </Link>
      </div>

      {/* FREQUENT FRIENDS */}
      {frequentFriends.length > 0 && (
        <div className="px-4 py-3 border-t border-[#1e1f22] mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#949ba4] uppercase">
              Frequent Friends
            </span>
            <HelpCircle className="h-3.5 w-3.5 text-[#949ba4]" />
          </div>
          <div className="flex gap-2">
            {frequentFriends.map((friend: User) => (
              <div
                key={friend.id}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <UserAvatar user={friend} size="md" showStatus />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIRECT MESSAGES */}
      <div className="flex-1 overflow-y-auto px-2 mt-4">
        <Suspense fallback={<DirectMessagesListSkeleton />}>
          <DirectMessagesList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={onConversationSelect}
          />
        </Suspense>
      </div>
    </div>
  );
}

function DirectMessagesListSkeleton() {
  return (
    <div className="space-y-0.5">
      <div className="px-2 mb-1">
        <Skeleton className="h-4 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 bg-accent/20 rounded animate-pulse" />
      ))}
    </div>
  );
}

export default FriendList;
