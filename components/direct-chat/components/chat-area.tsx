"use client";

import { ScrollArea } from "../../ui/scroll-area";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { useEffect, useRef, useState } from "react";
import { MessageItem } from "../../message-item";
import { UserProfilePopover } from "../../user-profile-popover";
import { DirectMessage, User } from "@/types";
import { useCurrentUser } from "@/providers/user-provider";

interface ChatAreaProps {
  initData: DirectMessage[];
  conversationId: string;
  otherUser: User;
}

export function ChatArea({
  initData,
  conversationId,
  otherUser,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(
    null
  );
  const { user: currentUser } = useCurrentUser();

  // Mark as read mutation
  const markAsRead = trpc.conversation.markAsRead.useMutation({
    onSuccess: () => {
      // Invalidate conversations list để update unread count và lastReadAt
      utils.conversation.listConversations.invalidate();

      // Update lastReadAt trong cache local để UI update ngay
      const conversations = utils.conversation.listConversations.getData();
      if (conversations) {
        const updatedConversations = conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastReadAt: new Date(), unreadCount: 0 }
            : c
        );
        utils.conversation.listConversations.setData(
          undefined,
          updatedConversations
        );
      }

      // Reset lastReadMessageId vì đã đọc hết
      setLastReadMessageId(null);
    },
  });

  const {
    data: newMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.conversation.getConversationMessages.useInfiniteQuery(
    {
      conversationId,
      limit: 30,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: {
        pages: [
          {
            messages: initData,
            // Nếu có ít nhất 30 messages, có thể có thêm message cũ hơn
            nextCursor: initData.length >= 30 ? initData[0].id : undefined,
          },
        ],
        pageParams: [undefined],
      },
    }
  );

  // Merge và sắp xếp messages theo thứ tự từ cũ đến mới
  const messages = Array.from(
    new Map(
      (newMessage?.pages.flatMap((p) => p.messages) ?? initData).map((msg) => [
        msg.id,
        msg,
      ])
    ).values()
  ).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Mark as read khi vào conversation lần đầu
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead.mutate({ conversationId });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Mark as read khi có tin nhắn mới từ người khác
  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      const lastMessage = messages[messages.length - 1];
      // Nếu tin nhắn cuối không phải của mình
      if (lastMessage.senderId !== currentUser.id) {
        markAsRead.mutate({ conversationId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Scroll to bottom on mount
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  // Intersection observer để load tin nhắn cũ hơn khi scroll lên trên
  useEffect(() => {
    if (!topRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage && hasNextPage) {
          const el = scrollRef.current;
          if (!el) return;

          const prevHeight = el.scrollHeight;
          const prevScrollTop = el.scrollTop;

          fetchNextPage().then(() => {
            requestAnimationFrame(() => {
              if (!el) return;
              // Giữ vị trí scroll sau khi load thêm messages
              const newHeight = el.scrollHeight;
              el.scrollTop = prevScrollTop + (newHeight - prevHeight);
            });
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get lastReadAt to show separator
  useEffect(() => {
    const fetchLastRead = async () => {
      const conversations = utils.conversation.listConversations.getData();
      const currentConv = conversations?.find((c) => c.id === conversationId);
      if (currentConv?.lastReadAt && messages.length > 0) {
        // Tìm message cuối cùng trước thời điểm lastReadAt
        const lastReadMsg = [...messages]
          .reverse() // Đảo ngược để tìm từ mới nhất
          .find(
            (m) => new Date(m.createdAt) <= new Date(currentConv.lastReadAt!)
          );

        if (lastReadMsg) {
          setLastReadMessageId(lastReadMsg.id);
        }
      }
    };
    fetchLastRead();
  }, [messages, conversationId, utils]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea viewportRef={scrollRef} className="flex-1 h-full">
        <div ref={topRef} className="h-4" />

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

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

            const isFirstUnread =
              lastReadMessageId &&
              idx > 0 &&
              messages[idx - 1].id === lastReadMessageId &&
              msg.senderId !== currentUser?.id;

            return (
              <div key={msg.id} className="relative">
                {isFirstUnread && (
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
