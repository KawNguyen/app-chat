"use client";

import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { UserAvatar } from "./user-avatar";
import { useRouter, usePathname } from "next/navigation";
import { playSound } from "@/lib/sound-effect";
import { User } from "@/types";
import { useCurrentUser } from "@/providers/user-provider";

export function DirectMessageListener() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const currentUserId = user?.id;

  trpc.conversation.onGlobalNewMessage.useSubscription(undefined, {
    onData(data) {
      const message = data.message;

      // Check if user is currently viewing this conversation
      const isViewingConversation =
        pathname === `/channels/me/${message.conversationId}`;

      // Update cache directly instead of invalidating
      const previousMessages =
        utils.conversation.getConversationMessages.getData({
          conversationId: message.conversationId,
        });

      if (previousMessages && message.sender) {
        // Check if message already exists (avoid duplicates)
        const messageExists = previousMessages.messages.some(
          (m) => m.id === message.id,
        );
        if (!messageExists) {
          // Add message to cache with proper structure
          const messageWithAttachments = {
            ...message,
            attachments: message.attachments || [],
          };

          utils.conversation.getConversationMessages.setData(
            { conversationId: message.conversationId },
            {
              ...previousMessages,
              messages: [
                ...previousMessages.messages,
                messageWithAttachments,
              ] as typeof previousMessages.messages,
            },
          );
        }
      } else if (isViewingConversation) {
        // Only invalidate if viewing and no cache exists
        utils.conversation.getConversationMessages.invalidate({
          conversationId: message.conversationId,
        });
      }

      // Update conversations list in cache
      const previousConversations =
        utils.conversation.listConversations.getData();
      if (previousConversations) {
        const updatedConversations = previousConversations.map((conv) => {
          if (conv.id === message.conversationId) {
            // Increment unread count if not viewing this conversation
            const newUnreadCount = isViewingConversation
              ? 0
              : (conv.unreadCount || 0) + 1;

            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: newUnreadCount,
            };
          }
          return conv;
        });
        utils.conversation.listConversations.setData(
          undefined,
          updatedConversations,
        );
      } else {
        // Only invalidate if no cache exists
        utils.conversation.listConversations.invalidate();
      }

      // Only show notification if it's NOT the current user's message
      if (message.senderId === currentUserId) {
        return; // Don't show notification for own messages
      }

      // Show notification even without sender (we'll fetch it)
      if (!isViewingConversation) {
        try {
          // Play notification sound
          playSound("/sounds/notification.mp3");
          console.log("Sound played");
        } catch (error) {
          console.error("Sound error:", error);
        }

        const senderName =
          message.sender?.displayName || message.sender?.userName || "Someone";
        const preview =
          message.content.length > 50
            ? message.content.substring(0, 50) + "..."
            : message.content;

        // Show Discord-style notification with avatar
        const toastId = toast(
          <div
            className="flex items-start gap-3 w-full cursor-pointer"
            onClick={() => {
              toast.dismiss(toastId);
              router.push(`/channels/me/${message.conversationId}`);
            }}
          >
            {message.sender && (
              <UserAvatar
                user={message.sender as User}
                size="sm"
                showStatus={false}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{senderName}</div>
              <div className="text-sm text-muted-foreground truncate">
                {preview}
              </div>
            </div>
          </div>,
          {
            duration: 4000,
            className: "cursor-pointer hover:bg-accent",
          },
        );
        console.log("📬 Toast shown with ID:", toastId);
      }
    },
    onError(error) {
      console.error("Direct message subscription error:", error);
    },
    enabled: !!currentUserId, // Only enable when user is logged in
  });

  // useEffect(() => {
  //   console.log("Subscription status:", {
  //     enabled: !!currentUserId,
  //     hasCurrentUserId: !!currentUserId,
  //   });
  // }, [currentUserId]);

  return null;
}
