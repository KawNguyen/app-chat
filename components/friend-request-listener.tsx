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
        } sent you a friend request!`,
      );

      // Update pending requests cache directly
      const previousRequests = utils.friend.listPendingRequests.getData();
      if (previousRequests) {
        // Check if request already exists
        const requestExists = previousRequests.some((r) => r.id === request.id);
        if (!requestExists) {
          // Add new request to cache
          const newRequest = {
            id: request.id,
            senderId: request.sender.id,
            receiverId: "", // Current user
            status: "PENDING" as const,
            createdAt: request.createdAt,
            updatedAt: request.createdAt,
            sender: request.sender,
          };
          utils.friend.listPendingRequests.setData(undefined, [
            newRequest,
            ...previousRequests,
          ]);
        }
      } else {
        // Fallback: invalidate only if no cache exists
        utils.friend.listPendingRequests.invalidate();
      }
    },
    onError(error) {
      console.error("Friend request subscription error:", error);
    },
  });

  return null;
}
