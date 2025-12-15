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

interface MessageUser {
  id: string;
  userName: string | null;
  displayName: string | null;
  image: string | null;
  status: string;
}

interface UserProfilePopoverProps {
  user: MessageUser;
  displayName: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function UserProfilePopover({
  user,
  displayName,
  children,
  side = "top",
  align = "start",
}: UserProfilePopoverProps) {
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
            <div className="h-[60px] bg-linear-to-br from-blue-500 via-purple-500 to-pink-500" />

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
                  <Badge variant="secondary" className="text-xs">
                    Friend
                  </Badge>
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
                    <p className="text-xs">Ngủ sớm dậy sớm :)))</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-xs">Oct 3, 2021</p>
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
