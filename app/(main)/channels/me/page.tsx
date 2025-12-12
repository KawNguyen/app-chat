"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/react";
import { UserAvatar } from "@/components/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  MoreVertical,
  Search,
  Check,
  X,
  Users,
} from "lucide-react";
import { AddFriendDialog } from "@/components/direct-chat/components/add-friend-dialog";
import { toast } from "sonner";
import { useUserStatus } from "@/providers/user-status-provider";
import { UserStatus } from "@/types";

type TabType = "online" | "all" | "pending" | "blocked";

interface Friend {
  id: string;
  userName: string | null;
  displayName: string | null;
  image: string | null;
  status: string;
  customStatus?: string | null;
}

interface PendingRequest {
  id: string;
  sender: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
  };
  createdAt: Date;
}

const Page = () => {
  const [activeTab, setActiveTab] = useState<TabType>("online");
  const [searchQuery, setSearchQuery] = useState("");
  const { setMultipleStatuses, getUserStatus } = useUserStatus();
  const router = useRouter();

  const { data: friends = [] } = trpc.friend.listFriends.useQuery();
  const { data: pendingRequests = [] } =
    trpc.friend.listPendingRequests.useQuery();
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
    onSuccess: () => {
      toast.success("Friend request accepted! You can now message each other.");
      utils.friend.listFriends.invalidate();
      utils.friend.listPendingRequests.invalidate();
      utils.conversation.listConversations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept request");
    },
  });

  const declineRequest = trpc.friend.declineFriendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request declined");
      utils.friend.listPendingRequests.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to decline request");
    },
  });

  // Filter friends based on active tab using global status
  const filteredFriends = (friends as Friend[]).filter((friend) => {
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
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends
          </h1>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "online" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("online")}
              className="h-8"
            >
              Online
            </Button>
            <Button
              variant={activeTab === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="h-8"
            >
              All
            </Button>
            <Button
              variant={activeTab === "pending" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("pending")}
              className="h-8"
            >
              Pending
            </Button>
            <AddFriendDialog />
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-3">
            {/* Pending Requests Tab */}
            {activeTab === "pending" ? (
              <>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Pending — {pendingRequests.length}
                </h2>
                {pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-base font-medium text-muted-foreground">
                      No pending friend requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {pendingRequests.map((request: PendingRequest) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar user={request.sender} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {request.sender.displayName ||
                                request.sender.userName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Incoming Friend Request
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-background hover:bg-green-600/20 hover:text-green-600"
                            title="Accept"
                            onClick={() =>
                              acceptRequest.mutate({ requestId: request.id })
                            }
                            disabled={acceptRequest.isPending}
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-background hover:bg-red-600/20 hover:text-red-600"
                            title="Decline"
                            onClick={() =>
                              declineRequest.mutate({ requestId: request.id })
                            }
                            disabled={declineRequest.isPending}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  {activeTab === "online"
                    ? `Online — ${onlineCount}`
                    : `All Friends — ${friends.length}`}
                </h2>

                {filteredFriends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-muted-foreground mb-2">
                      <svg
                        className="w-24 h-24 mx-auto mb-4 opacity-20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium">
                      No one around to play with Wumpus.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredFriends.map((friend: Friend) => {
                      const currentStatus =
                        getUserStatus(friend.id) || friend.status;
                      return (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <UserAvatar
                              user={{ ...friend, status: currentStatus }}
                              size="md"
                              showStatus
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {friend.displayName || friend.userName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {currentStatus === "ONLINE"
                                  ? friend.customStatus || "Online"
                                  : currentStatus}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full bg-background hover:bg-secondary"
                              title="Message"
                              onClick={() =>
                                getOrCreateConversation.mutate({
                                  otherUserId: friend.id,
                                })
                              }
                              disabled={getOrCreateConversation.isPending}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full bg-background hover:bg-secondary"
                              title="More"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Page;
