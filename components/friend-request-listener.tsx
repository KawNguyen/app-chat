"use client";

import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";

export function FriendRequestListener() {
  const utils = trpc.useUtils();

  trpc.friend.onFriendRequest.useSubscription(undefined, {
    onData(request) {
      toast(
        `${
          request.sender.displayName || request.sender.userName
        } sent you a friend request!`
      );
      // Invalidate to update the pending requests list
      utils.friend.listPendingRequests.invalidate();
    },
    onError(error) {
      console.error("Friend request subscription error:", error);
    },
  });

  return null;
}
