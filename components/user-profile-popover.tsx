"use client";

import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode } from "react";
import { User, FriendRequestStatus } from "@/types";
import { useFriendActions } from "@/hooks/use-friend-actions";
import FriendAction from "./drop-down-menu/friend-action";

interface UserProfilePopoverProps {
  user: User;
  displayName: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  conversationId?: string;
  isFriend?: boolean;
  friendRequestStatus?: FriendRequestStatus;
  showFriendActions?: boolean;
  currentUserId?: string;
}

export function UserProfilePopover({
  user,
  displayName,
  children,
  side = "top",
  align = "start",
  conversationId,
  isFriend = false,
  friendRequestStatus,
  showFriendActions = true,
  currentUserId,
}: UserProfilePopoverProps) {
  const isOwnProfile = currentUserId && user.id === currentUserId;

  const {
    handleRemoveFriend,
    handleSendFriendRequest,
    removeFriendMutation,
    sendFriendRequestMutation,
  } = useFriendActions({
    user: user,
    conversationId,
  });


  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden"
        side={side}
        align={align}
      >
        <div className="flex flex-col">
          {/* Profile Header with Banner */}
          <div className="relative">
            {/* Banner */}
            <div className="relative h-20 bg-green-300">
              {
                showFriendActions && !isOwnProfile && (
                  <div className="absolute top-2 right-2">
                    <FriendAction
                      user={{
                        id: user.id,
                        userName: user.userName,
                        displayName: user.displayName,
                        image: user.image,
                        status: user.status,
                      }}
                      isFriend={isFriend}
                      friendRequestStatus={friendRequestStatus}
                      onSendFriendRequest={handleSendFriendRequest}
                      onRemoveFriend={handleRemoveFriend}
                      sendFriendRequestMutation={sendFriendRequestMutation}
                      removeFriendMutation={removeFriendMutation}
                    />
                  </div>
                )
              }

            </div>

            {/* Avatar */}
            <div className="absolute -bottom-8 left-3">
              <UserAvatar user={user} size="lg" showStatus sizeStatus="5" />
            </div>
          </div>

          {/* User Info */}
          <ScrollArea className="max-h-[300px]">
            <div className="mt-10 px-3 pb-3">
              <div className="bg-card rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold">{displayName}</h2>
                  {!isOwnProfile && isFriend && (
                    <Badge variant="secondary" className="text-xs">
                      Friend
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user?.userName ? `@${user.userName}` : "No username"}
                </p>

                <Separator className="my-2" />
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      About Me
                    </p>
                    <p className="text-xs">{user.bio || "No bio available"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
