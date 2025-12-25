"use client";

import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useVoiceControls } from "@/hooks/use-voice-controls";
import { User, UserStatus } from "@/types";
import { useState } from "react";
import { UserCard, UserMenuItems, VoiceControls } from "./user-nav";

export function NavUser({
  user,
  hasPassword,
  logout,
}: {
  user: User;
  hasPassword: boolean;
  logout: () => void;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(
    user?.status && user?.status !== UserStatus.OFFLINE
      ? (user.status as UserStatus)
      : UserStatus.ONLINE,
  );

  const { isMuted, isDeafened, toggleMute, toggleDeafen } = useVoiceControls();

  return (
    <div className="flex items-center gap-1 p-1.5 bg-secondary/30 border rounded-lg overflow-hidden">
      {/* User Info */}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="hover:bg-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Button
            variant="ghost"
            className=" flex-1 justify-start gap-2 h-auto px-2 py-1.5"
          >
            <UserAvatar user={user} size="sm" showStatus />
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-xs font-semibold text-foreground truncate">
                {user?.displayName || user?.userName}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user?.userName}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 rounded-md p-0 mb-2"
          side="top"
          align="start"
          sideOffset={8}
        >
          {/* User Card */}
          <UserCard user={user} />

          {/* Menu Items */}
          <UserMenuItems
            user={user}
            currentStatus={currentStatus}
            onStatusChange={setCurrentStatus}
            onEditProfile={() => router.push("/settings/profile")}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        onToggleMute={toggleMute}
        onToggleDeafen={toggleDeafen}
        user={user}
        logout={logout}
        hasPassword={hasPassword}
      />
    </div>
  );
}
