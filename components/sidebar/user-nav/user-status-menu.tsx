"use client";

import { Check } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { statusConfig } from "@/constants/status-config";
import { UserStatus } from "@/types";
import { trpc } from "@/lib/trpc/react";

interface UserStatusProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}

// Map UI status to API status
const statusMap: Record<UserStatus, UserStatus> = {
  [UserStatus.ONLINE]: UserStatus.ONLINE,
  [UserStatus.IDLE]: UserStatus.IDLE,
  [UserStatus.DND]: UserStatus.DND,
  [UserStatus.INVISIBLE]: UserStatus.INVISIBLE,
  [UserStatus.OFFLINE]: UserStatus.OFFLINE,
};

export function UserStatusMenu({
  currentStatus,
  onStatusChange,
}: UserStatusProps) {
  const utils = trpc.useUtils();

  const updateStatus = trpc.user.updateStatus.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
    },
  });

  const handleStatusChange = (
    status: Exclude<UserStatus, UserStatus.OFFLINE>
  ) => {
    // Update local state immediately for better UX
    onStatusChange(status);

    // Call API to update status
    updateStatus.mutate({
      status: statusMap[status],
    });
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer rounded px-2 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              statusConfig[currentStatus].color
            )}
          />
          <span>{statusConfig[currentStatus].label}</span>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-68 p-1">
          {Object.entries(statusConfig).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <DropdownMenuItem
                key={status}
                className="cursor-pointer px-2 py-2.5 rounded"
                disabled={updateStatus.isPending}
                onClick={() =>
                  handleStatusChange(
                    status as Exclude<UserStatus, UserStatus.OFFLINE>
                  )
                }
              >
                <div className="flex items-start gap-3 w-full">
                  <StatusIcon
                    className={`h-5 w-5 mt-0.5 shrink-0 ${config.text}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.label}</span>
                      {currentStatus === status && (
                        <Check className="h-4 w-4 ml-auto shrink-0" />
                      )}
                    </div>
                    {config.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {config.description}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
