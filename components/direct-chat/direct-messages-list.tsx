"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setLastDMConversation } from "@/lib/utils/server-cache";
import { useUserStatus } from "@/providers/user-status-provider";
import { UserStatus } from "@/types";
import { useEffect } from "react";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
    status: string;
  };
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
}

interface DirectMessagesListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

function DirectMessagesList({
  conversations,
  activeConversationId,
  onConversationSelect,
}: DirectMessagesListProps) {
  const { setMultipleStatuses, getUserStatus } = useUserStatus();

  // Initialize global status cho conversation users
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      const statuses = conversations.map((conv) => ({
        userId: conv.otherUser.id,
        status: conv.otherUser.status as UserStatus,
      }));
      setMultipleStatuses(statuses);
    }
  }, [conversations, setMultipleStatuses]);

  return (
    <>
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
          conversations.map((conv: Conversation) => {
            const currentStatus =
              getUserStatus(conv.otherUser.id) || conv.otherUser.status;
            return (
              <Link
                key={conv.id}
                href={`/channels/me/${conv.id}`}
                className={cn(
                  "flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#202022] transition-colors group",
                  activeConversationId === conv.id
                    ? "bg-[#202022] text-white  hover:bg-[#131314]"
                    : "text-[#b5bac1] hover:text-white",
                )}
                onClick={() => {
                  onConversationSelect(conv.id);
                  setLastDMConversation(conv.id);
                }}
              >
                <>
                  <UserAvatar
                    user={{ ...conv.otherUser, status: currentStatus }}
                    size="sm"
                    showStatus
                  />
                  <span className="text-sm font-medium truncate flex-1">
                    {conv.otherUser?.displayName || conv.otherUser?.userName}
                  </span>
                </>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-75"
                >
                  <X className="h-4 w-4 text-[#949ba4] hover:text-white" />
                </Button>
              </Link>
            );
          })
        ) : (
          <div className="text-xs text-[#949ba4] text-center py-4">
            No direct messages yet
          </div>
        )}
      </div>
    </>
  );
}

export default DirectMessagesList;
