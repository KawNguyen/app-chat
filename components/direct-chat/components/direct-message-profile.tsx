"use client";

import { UserAvatar } from "@/components/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Phone, Video, Users, ChevronRight, Volume2, Bell } from "lucide-react";
import { useUserStatus } from "@/providers/user-status-provider";
import { trpc } from "@/lib/trpc/react";
import FriendAction from "@/components/drop-down-menu/friend-action";

interface DirectMessageProfileProps {
  user: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
    status: string;
  };
  conversationId: string;
}

export function DirectMessageProfile({
  user,
  conversationId,
}: DirectMessageProfileProps) {
  const { getUserStatus } = useUserStatus();
  const currentStatus = getUserStatus(user.id) || user.status;

  const displayName = user.displayName || user.userName || "User";
  const memberSince = "Oct 3, 2021"; // Hardcoded for now

  // Get conversation data with friend status
  const { data: conversationData } =
    trpc.conversation.getConversationById.useQuery(
      { conversationId },
      { enabled: !!conversationId }
    );

  const isFriend = conversationData?.isFriend ?? false;
  const friendRequestStatus = conversationData?.friendRequestStatus;

  return (
    <>
      <div className="w-full shrink-0 bg-background">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {/* Profile Header with Banner */}
            <div className="relative">
              {/* Banner */}
              <div className="h-[120px] bg-linear-to-br from-blue-500 via-purple-500 to-pink-500" />

              {/* Avatar */}
              <div className="absolute -bottom-12 left-4">
                <div className="relative">
                  <UserAvatar
                    user={{ ...user, status: currentStatus }}
                    size="xl"
                    showStatus
                    sizeStatus="6"
                  />
                </div>
              </div>

              {/* More Options Menu */}
              <div className="absolute top-4 right-4">
                <FriendAction
                  isFriend={isFriend}
                  user={user}
                  conversationId={conversationId}
                  friendRequestStatus={friendRequestStatus?.status}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="mt-16 px-4 pb-4">
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  {isFriend && (
                    <Badge variant="secondary" className="text-xs">
                      Friend
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.userName ? `@${user.userName}` : "No username"}
                </p>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      About Me
                    </p>
                    <p className="text-sm">Ngủ sớm dậy sớm :)))</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-sm">{memberSince}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-2"
                  disabled
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center gap-2"
                  disabled
                >
                  <Video className="h-4 w-4" />
                  Video
                </Button>
              </div>
            </div>

            <Separator />

            {/* Mutual Servers */}
            <div className="px-4 py-3">
              <button className="w-full flex items-center justify-between text-sm font-semibold hover:bg-accent rounded p-2 transition-colors">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mutual Servers — 16
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <Separator />

            {/* Mutual Friends */}
            <div className="px-4 py-3">
              <button className="w-full flex items-center justify-between text-sm font-semibold hover:bg-accent rounded p-2 transition-colors">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mutual Friends — 15
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <Separator />

            {/* Settings */}
            <div className="px-4 py-3 space-y-1">
              <button className="w-full flex items-center gap-3 text-sm hover:bg-accent rounded p-2 transition-colors">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span>Mute Conversation</span>
              </button>
              <button className="w-full flex items-center gap-3 text-sm hover:bg-accent rounded p-2 transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Notification Settings</span>
              </button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
