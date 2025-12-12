"use client";

import { ScrollArea } from "../../ui/scroll-area";
import Image from "next/image";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { useEffect, useRef } from "react";

interface ChatAreaProps {
  conversationId: string;
  otherUser?: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
    status: string;
  };
}

export function ChatArea({ conversationId, otherUser }: ChatAreaProps) {
  const utils = trpc.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data } = trpc.conversation.getConversationMessages.useQuery(
    {
      conversationId,
      limit: 50,
    },
    {
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  trpc.conversation.onNewConversationMessage.useSubscription(
    { conversationId },
    {
      onData: () => {
        utils.conversation.getConversationMessages.invalidate({
          conversationId,
        });
      },
    },
  );

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
            <div className="relative">
              <UserAvatar user={otherUser} size="lg" showStatus={false} />
            </div>
            <h2 className="mt-6 text-2xl font-bold">
              {otherUser.displayName || otherUser.userName}
            </h2>
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

            const isCurrentUser = msg.senderId === currentUser?.id;
            const displayName = isCurrentUser
              ? currentUser?.displayName || currentUser?.userName || "You"
              : msg.sender.displayName || msg.sender.userName || "User";

            return (
              <div key={msg.id} className="group relative">
                <div
                  className={`flex gap-4 hover:bg-secondary/30 -mx-2 px-2 rounded transition-colors ${
                    showAvatar ? "mt-[17px] py-0.5" : "py-0.5"
                  }`}
                >
                  <div className="w-10 shrink-0 pt-0.5">
                    {showAvatar ? (
                      <UserAvatar user={msg.sender} size="md" />
                    ) : (
                      <div className="w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <p className="font-semibold text-[15px] text-foreground hover:underline cursor-pointer">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatTimestamp(msg.createdAt)}
                        </p>
                      </div>
                    )}
                    <p className="text-foreground text-[15px] leading-5.5 wrap-break-word">
                      {msg.content}
                      {msg.isEdited && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          (edited)
                        </span>
                      )}
                    </p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.attachments.map(
                          (attachment: {
                            id: string;
                            type: string;
                            url: string;
                            name: string;
                          }) => {
                            if (attachment.type.startsWith("image/")) {
                              return (
                                <Image
                                  key={attachment.id}
                                  src={attachment.url}
                                  alt={attachment.name}
                                  width={400}
                                  height={300}
                                  className="rounded-md max-w-sm max-h-80 object-cover border"
                                />
                              );
                            }
                            return (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-secondary rounded text-sm hover:bg-secondary/80 transition-colors border"
                              >
                                📎 {attachment.name}
                              </a>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  );
}
