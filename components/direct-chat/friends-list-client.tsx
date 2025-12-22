"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useUserStatus } from "@/providers/user-status-provider";
import { User, UserStatus } from "@/types";
import { SearchBar } from "../search-bar";
import type { TabType, Friend } from "./friends-list/types";
import {
  FriendsHeader,
  FriendsListSection,
  PendingRequestsList,
} from "./friends-list";

export function FriendsListClient() {
  const [activeTab, setActiveTab] = useState<TabType>("online");
  const [searchQuery, setSearchQuery] = useState("");
  const { setMultipleStatuses, getUserStatus } = useUserStatus();
  const router = useRouter();

  const { data: friends = [] } = trpc.friend.listFriends.useQuery();
  const { data: pendingRequests = [] } =
    trpc.friend.listPendingRequests.useQuery() as {
      data: {
        id: string;
        sender: User;
        createdAt: Date;
      }[];
    };
  const utils = trpc.useUtils();

  // Initialize global status cho friends
  useEffect(() => {
    if (friends && friends.length > 0) {
      const statuses = (friends as Friend[]).map((f) => ({
        userId: f.id,
        status: f.status as UserStatus,
      }));
      setMultipleStatuses(statuses);
    }
  }, [friends, setMultipleStatuses]);

  const getOrCreateConversation =
    trpc.conversation.getOrCreateConversation.useMutation({
      onSuccess: (data) => {
        router.push(`/channels/me/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create conversation");
      },
    });

  const acceptRequest = trpc.friend.acceptFriendRequest.useMutation({
    onSuccess: (data, variables) => {
      // Update friends list cache directly
      const previousFriends = utils.friend.listFriends.getData();
      if (previousFriends && data.friend) {
        utils.friend.listFriends.setData(undefined, [
          ...previousFriends,
          data.friend,
        ]);
      } else {
        utils.friend.listFriends.invalidate();
      }

      // Update pending requests cache - remove accepted request
      const previousRequests = utils.friend.listPendingRequests.getData();
      if (previousRequests) {
        const updatedRequests = previousRequests.filter(
          (r) => r.id !== variables.requestId
        );
        utils.friend.listPendingRequests.setData(undefined, updatedRequests);
      } else {
        utils.friend.listPendingRequests.invalidate();
      }

      // Update conversations list - only invalidate if new conversation created
      if (data.conversationId) {
        utils.conversation.listConversations.invalidate();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept request");
    },
  });

  const declineRequest = trpc.friend.declineFriendRequest.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Friend request declined");

      // Update pending requests cache - remove declined request
      const previousRequests = utils.friend.listPendingRequests.getData();
      if (previousRequests) {
        const updatedRequests = previousRequests.filter(
          (r) => r.id !== variables.requestId
        );
        utils.friend.listPendingRequests.setData(undefined, updatedRequests);
      } else {
        utils.friend.listPendingRequests.invalidate();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to decline request");
    },
  });

  // Filter friends based on active tab using global status
  const filteredFriends = (friends as User[]).filter((friend) => {
    const matchesSearch =
      friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.userName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "online") {
      const currentStatus = getUserStatus(friend.id) || friend.status;
      return currentStatus === "ONLINE" || currentStatus === "IDLE";
    }
    return true;
  });

  const onlineCount = (friends as Friend[]).filter((f) => {
    const currentStatus = getUserStatus(f.id) || f.status;
    return currentStatus === "ONLINE" || currentStatus === "IDLE";
  }).length;

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <FriendsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={pendingRequests.length}
      />

      <SearchBar className="px-4 pt-4" value={searchQuery} onChange={setSearchQuery} />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-3">
            {activeTab === "pending" ? (
              <PendingRequestsList
                requests={pendingRequests}
                onAccept={(requestId) => acceptRequest.mutate({ requestId })}
                onDecline={(requestId) => declineRequest.mutate({ requestId })}
                isAccepting={acceptRequest.isPending}
                isDeclining={declineRequest.isPending}
              />
            ) : (
              <FriendsListSection
                friends={filteredFriends}
                activeTab={activeTab}
                onlineCount={onlineCount}
                getUserStatus={getUserStatus}
                onCreateConversation={(friendId) =>
                  getOrCreateConversation.mutate({ otherUserId: friendId })
                }
                isCreatingConversation={getOrCreateConversation.isPending}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
