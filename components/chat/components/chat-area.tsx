"use client";

import { ScrollArea } from "../../ui/scroll-area";
import Image from "next/image";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { useRef, useEffect } from "react";

interface ChatAreaProps {
  channelId: string;
}

export function ChatArea({ channelId }: ChatAreaProps) {
  const utils = trpc.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data } = trpc.message.getMessages.useQuery(
    {
      channelId,
      limit: 50,
    },
    {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  // Subscribe to new messages
  trpc.message.onNewMessage.useSubscription(
    { channelId },
    {
      onData: () => {
        utils.message.getMessages.invalidate({ channelId, limit: 50 });
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

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 h-full">
        {/* Messages */}
        <div className="flex flex-col px-4 pb-4 pt-4">
          {messages.map((msg, idx: number) => {
            const FIVE_MINUTES = 5 * 60 * 1000;

            const showAvatar =
              idx === 0 ||
              messages[idx - 1].userId !== msg.userId ||
              new Date(msg.createdAt).getTime() -
                new Date(messages[idx - 1].createdAt).getTime() >
                FIVE_MINUTES;

            const displayName = msg.member?.nickname || "User";

            return (
              <div key={msg.id} className="group">
                <div
                  className={`flex gap-4 hover:bg-accent/30 -mx-2 px-2 rounded transition-colors ${
                    showAvatar ? "mt-[17px] py-0.5" : "py-0.5"
                  }`}
                >
                  <div className="w-10 shrink-0 pt-0.5">
                    {showAvatar ? (
                      <UserAvatar user={msg.member.user} size="md" />
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
                        <p className="font-semibold text-[15px]">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatTimestamp(msg.createdAt)}
                        </p>
                      </div>
                    )}
                    <p className="text-foreground text-[15px] leading-5.5 whitespace-pre-wrap wrap-break-word">
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
                                  className="rounded max-w-sm max-h-80 object-cover"
                                />
                              );
                            }
                            return (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-accent rounded text-sm hover:bg-accent/80 transition-colors"
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
