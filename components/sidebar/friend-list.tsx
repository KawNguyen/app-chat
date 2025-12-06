"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, ShoppingBag, HelpCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  username: string | null;
  displayName: string | null;
  image: string | null;
  status: string;
  customStatus: string | null;
  conversationId?: string;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    status: string;
  };
  lastMessage?: unknown;
  updatedAt: Date;
}

interface FriendListProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

export function FriendList({
  activeConversationId,
  onConversationSelect,
}: FriendListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations } =
    trpc.conversation.listConversations.useQuery();
  const { data: friends } = trpc.friend.listFriends.useQuery();

  // Get frequent friends (first 3-5 friends for demo)
  const frequentFriends = friends?.slice(0, 5) || [];

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
            {frequentFriends.map((friend: Friend) => (
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
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs font-semibold text-[#949ba4] uppercase">
            Direct Messages
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <Plus className="h-4 w-4 text-[#949ba4] hover:text-white" />
          </Button>
        </div>

        <div className="space-y-0.5">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv: Conversation) => (
              <Link
                key={conv.id}
                href={`/channels/me/${conv.id}`}
                className={cn(
                  "flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#404249] transition-colors group",
                  activeConversationId === conv.id
                    ? "bg-[#404249] text-white"
                    : "text-[#b5bac1] hover:text-white"
                )}
                onClick={() => onConversationSelect(conv.id)}
              >
                <UserAvatar user={conv.otherUser} size="sm" showStatus />
                <span className="text-sm font-medium truncate flex-1">
                  {conv.otherUser?.displayName || conv.otherUser?.username}
                </span>
              </Link>
            ))
          ) : (
            <div className="text-xs text-[#949ba4] text-center py-4">
              No direct messages yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
