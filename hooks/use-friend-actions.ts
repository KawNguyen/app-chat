"use client";

import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";

interface UseFriendActionsProps {
  user: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
    status: string;
  };
  conversationId?: string;
  onRemoveSuccess?: () => void;
}

export const useFriendActions = ({
  user,
  conversationId,
  onRemoveSuccess,
}: UseFriendActionsProps) => {
  const utils = trpc.useUtils();

  const displayName = user.displayName || user.userName || "User";

  // Mutations
  const removeFriendMutation = trpc.friend.removeFriend.useMutation({
    onSuccess: () => {
      toast.success(`Removed ${displayName} from your friends`);
      onRemoveSuccess?.();

      const previousFriends = utils.friend.listFriends.getData();
      if (previousFriends) {
        const updatedFriends = previousFriends.filter((f) => f.id !== user.id);
        utils.friend.listFriends.setData(undefined, updatedFriends);
      }

      if (conversationId) {
        utils.conversation.getConversationById.invalidate({ conversationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove friend");
    },
  });

  const sendFriendRequestMutation = trpc.friend.sendFriendRequest.useMutation({
    onSuccess: () => {
      if (conversationId) {
        utils.conversation.getConversationById.invalidate({ conversationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send friend request");
    },
  });

  const handleRemoveFriend = () => {
    removeFriendMutation.mutate({ friendId: user.id });
  };

  const handleSendFriendRequest = () => {
    if (user.userName) {
      sendFriendRequestMutation.mutate({ userName: user.userName });
    }
  };

  return {
    removeFriendMutation,
    sendFriendRequestMutation,
    handleRemoveFriend,
    handleSendFriendRequest,
  };
};
