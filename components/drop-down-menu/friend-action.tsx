"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { UserRoundCheck, UserRoundPlus, UserX } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";

interface FriendActionProps {
  isFriend: boolean;
  user: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
    status: string;
  };
  conversationId?: string;
  friendRequestStatus?: string;
}

const FriendAction = ({
  isFriend,
  user,
  conversationId,
  friendRequestStatus,
}: FriendActionProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const utils = trpc.useUtils();

  const displayName = user.displayName || user.userName || "User";

  // Mutations
  const removeFriendMutation = trpc.friend.removeFriend.useMutation({
    onSuccess: () => {
      toast.success(`Removed ${displayName} from your friends`);
      setShowRemoveDialog(false);

      // Update friends list cache
      const previousFriends = utils.friend.listFriends.getData();
      if (previousFriends) {
        const updatedFriends = previousFriends.filter((f) => f.id !== user.id);
        utils.friend.listFriends.setData(undefined, updatedFriends);
      }

      // Update conversation cache if exists
      if (conversationId) {
        // Just invalidate this one since structure is complex
        utils.conversation.getConversationById.invalidate({ conversationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove friend");
    },
  });

  const sendFriendRequestMutation = trpc.friend.sendFriendRequest.useMutation({
    onSuccess: () => {
      // Update conversation cache to reflect pending status
      if (conversationId) {
        // Invalidate conversation to get updated friendRequestStatus
        utils.conversation.getConversationById.invalidate({ conversationId });
      }
      // No need to invalidate pending requests here - user sent the request
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send friend request");
    },
  });

  // Handlers
  const handleRemoveFriend = () => {
    removeFriendMutation.mutate({ friendId: user.id });
  };

  const handleSendFriendRequest = () => {
    if (user.userName) {
      sendFriendRequestMutation.mutate({ userName: user.userName });
    }
  };

  if (!isFriend) {
    return (
      <Button
        onClick={handleSendFriendRequest}
        disabled={
          sendFriendRequestMutation.isPending ||
          friendRequestStatus === "PENDING"
        }
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80"
      >
        <UserRoundPlus className="h-5 w-5 text-white" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80"
          >
            <UserRoundCheck className="h-5 w-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <UserX className="h-4 w-4 mr-2" />
            Remove Friend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Friend</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{displayName}</strong>{" "}
              from your friends? You won&apos;t be able to send direct messages
              unless they add you back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={removeFriendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveFriend}
              disabled={removeFriendMutation.isPending}
            >
              {removeFriendMutation.isPending ? "Removing..." : "Remove Friend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FriendAction;
