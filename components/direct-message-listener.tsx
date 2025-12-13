"use client";

import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { UserAvatar } from "./user-avatar";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { playSound } from "@/lib/sound-effect";
// import { useEffect } from "react";

export function DirectMessageListener() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // useEffect(() => {
  //   console.log("DirectMessageListener mounted");
  //   console.log("Current user ID:", currentUserId);
  //   console.log("Current pathname:", pathname);
  //   console.log("Session:", session);
  // }, [currentUserId, pathname, session]);

  trpc.conversation.onGlobalNewMessage.useSubscription(undefined, {
    onData(data) {
      const message = data.message;

      // Don't show notification if it's the current user's message
      if (message.senderId === currentUserId) {
        return;
      }

      // Check if user is currently viewing this conversation
      const isViewingConversation =
        pathname === `/channels/me/${message.conversationId}`;

      // Always invalidate queries to update UI
      utils.conversation.listConversations.invalidate();
      utils.conversation.getConversationMessages.invalidate({
        conversationId: message.conversationId,
      });

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
              <UserAvatar user={message.sender} size="sm" showStatus={false} />
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
          }
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
