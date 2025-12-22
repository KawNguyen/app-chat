"use client";

import { ScrollArea } from "../../ui/scroll-area";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { useEffect, useRef, useState } from "react";
import { MessageItem } from "../../message-item";
import { UserProfilePopover } from "../../user-profile-popover";
import { User } from "@/types";
import { DirectMessage } from "@prisma/client";

interface ChatAreaProps {
  conversationId: string;
  otherUser: User;
}

export function ChatArea({ conversationId, otherUser }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(
    null
  );

  const { data } = trpc.conversation.getConversationMessages.useQuery(
    {
      conversationId,
      limit: 50,
    },
    {
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  // Mark as read mutation
  const markAsRead = trpc.conversation.markAsRead.useMutation({
    onSuccess: () => {
      // Update conversations list to clear unread count
      utils.conversation.listConversations.invalidate();
    },
  });

  // Auto mark as read when viewing conversation
  useEffect(() => {
    if (conversationId) {
      // Mark as read after a short delay to ensure messages are loaded
      const timer = setTimeout(() => {
        markAsRead.mutate({ conversationId });
      }, 500);

      return () => clearTimeout(timer);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Get lastReadAt to show separator
  useEffect(() => {
    const fetchLastRead = async () => {
      const conversations = utils.conversation.listConversations.getData();
      const currentConv = conversations?.find((c) => c.id === conversationId);
      if (currentConv?.lastReadAt && data?.messages) {
        // Find the last message that was read
        const lastReadMsg = data.messages.find(
          (m) => new Date(m.createdAt) <= new Date(currentConv.lastReadAt!)
        );
        if (lastReadMsg) {
          setLastReadMessageId(lastReadMsg.id);
        }
      }
    };
    fetchLastRead();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const messages = data?.messages || [];
  const { data: currentUser } = trpc.user.me.useQuery();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-full">
        {/* Welcome Message */}
        {messages.length === 0 && otherUser && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center py-20">
            <UserProfilePopover
              user={otherUser}
              displayName={
                otherUser.displayName || otherUser.userName || "User"
              }
              side="right"
              align="center"
            >
              <div className="relative cursor-pointer">
                <UserAvatar user={otherUser} size="lg" showStatus={false} />
              </div>
            </UserProfilePopover>
            <UserProfilePopover
              user={otherUser}
              displayName={
                otherUser.displayName || otherUser.userName || "User"
              }
              side="right"
              align="center"
            >
              <h2 className="mt-6 text-2xl font-bold hover:underline cursor-pointer">
                {otherUser.displayName || otherUser.userName}
              </h2>
            </UserProfilePopover>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              This is the beginning of your direct message history with{" "}
              <span className="font-semibold">
                @{otherUser.userName || otherUser.displayName}
              </span>
              .
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No group in common
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex flex-col px-4 pb-4 pt-4">
          {messages.map((msg, idx: number) => {
            const showAvatar =
              idx === 0 || messages[idx - 1].senderId !== msg.senderId;

            // Check if this is the first unread message
            const isFirstUnread =
              lastReadMessageId &&
              idx > 0 &&
              messages[idx - 1].id === lastReadMessageId;

            return (
              <div key={msg.id} className="relative">
                {/* Unread Separator Line - Discord style */}
                {isFirstUnread && !(msg.senderId === currentUser?.id) && (
                  <div className="flex items-center my-2 -mx-4">
                    <div className="flex-1 h-px bg-red-500" />
                    <span className="px-2 text-xs font-semibold text-red-500">
                      NEW
                    </span>
                    <div className="flex-1 h-px bg-red-500" />
                  </div>
                )}

                <MessageItem
                  message={msg as DirectMessage}
                  currentUserId={currentUser?.id}
                  showAvatar={showAvatar}
                  formatTimestamp={formatTimestamp}
                />
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  );
}
