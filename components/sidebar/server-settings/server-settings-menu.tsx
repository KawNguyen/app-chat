"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Settings, Trash2, ChevronDown, LogOut } from "lucide-react";
import { DeleteServerDialog } from "./delete-server-dialog";
import { LeaveServerDialog } from "./leave-server-dialog";

interface ServerSettingsMenuProps {
  serverId: string;
  serverName: string;
  isOwner: boolean;
}

export function ServerSettingsMenu({
  serverId,
  serverName,
  isOwner,
}: ServerSettingsMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 h-8">
            <span className="text-sm font-medium truncate max-w-[150px]">
              {serverName}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Server Settings
          </DropdownMenuItem>

          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Server
              </DropdownMenuItem>
            </>
          )}

          {!isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setLeaveDialogOpen(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Server
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteServerDialog
        serverId={serverId}
        serverName={serverName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <LeaveServerDialog
        serverId={serverId}
        serverName={serverName}
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
      />
    </>
  );
}
