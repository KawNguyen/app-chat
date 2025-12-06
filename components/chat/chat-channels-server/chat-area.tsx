"use client";

import { ScrollArea } from "../../ui/scroll-area";
import Image from "next/image";
import { MessageInput } from "./message-input";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";

interface ChatAreaProps {
  channelId: string;
}

export function ChatArea({ channelId }: ChatAreaProps) {
  const utils = trpc.useUtils();

  const { data } = trpc.message.getMessages.useQuery({
    channelId,
    limit: 50,
  });

  // Subscribe to new messages
  trpc.message.onNewMessage.useSubscription(
    { channelId },
    {
      onData: () => {
        // Invalidate query to refetch messages
        utils.message.getMessages.invalidate({ channelId, limit: 50 });
      },
    }
  );

  const sendMessage = trpc.message.sendMessage.useMutation({
    onSuccess: () => {
      utils.message.getMessages.invalidate({ channelId, limit: 50 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleSendMessage = (content: string) => {
    sendMessage.mutate({ channelId, content });
  };

  const messages = data?.messages || [];

  return (
    <div className="flex flex-col h-full px-3 pb-3">
      <ScrollArea className="flex-1">
        {/* Messages */}
        <div className="flex flex-col gap-0.5 px-4 pb-4 pt-4">
          {messages.map((msg, idx: number) => {
            const showAvatar =
              idx === 0 || messages[idx - 1].userId !== msg.userId;

            const displayName =
              msg.member?.nickname ||
              msg.user?.displayName ||
              msg.user?.name ||
              "User";

            return (
              <div key={msg.id} className="group">
                <div className="flex gap-4 hover:bg-accent/30 px-2 py-1 rounded transition-colors">
                  <div className="w-10 shrink-0">
                    {showAvatar ? (
                      <UserAvatar user={msg.user} size="md" />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="font-semibold text-sm">{displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(msg.createdAt)}
                        </p>
                      </div>
                    )}
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
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
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <MessageInput channelName="chat" onSendMessage={handleSendMessage} />
    </div>
  );
}
