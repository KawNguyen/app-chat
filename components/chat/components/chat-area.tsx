"use client";

import { ScrollArea } from "../../ui/scroll-area";
import { trpc } from "@/lib/trpc/react";
import { useRef, useEffect } from "react";
import { MessageItem } from "../../message-item";
import { Message } from "@/types";
import { useCurrentUser } from "@/providers/user-provider";

interface ChatAreaProps {
  // channelId: string;
  initData?: Message[];
}

export function ChatArea({ initData }: ChatAreaProps) {
  const utils = trpc.useUtils();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useCurrentUser();

  // const { data } = trpc.message.getMessages.useQuery(
  //   {
  //     channelId,
  //     limit: 50,
  //   },
  //   {
  //     staleTime: 30 * 1000, // 30 seconds
  //     refetchOnWindowFocus: false,
  //   }
  // );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initData]);

  // Subscribe to new messages
  trpc.message.onNewMessage.useSubscription(
    { channelId: initData && initData.length > 0 ? initData[0].channelId : "" },
    {
      onData: () => {
        utils.message.getMessages.invalidate({
          channelId:
            initData && initData.length > 0 ? initData[0].channelId : "",
          limit: 50,
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

  const messages = initData || [];

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

            return (
              <MessageItem
                key={msg.id}
                message={msg as Message}
                currentUserId={currentUser?.id}
                showAvatar={showAvatar}
                formatTimestamp={formatTimestamp}
              />
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  );
}
