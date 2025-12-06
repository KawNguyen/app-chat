"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Trash2, ChevronDown, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [confirmText, setConfirmText] = useState("");

  const router = useRouter();
  const utils = trpc.useUtils();

  const deleteServer = trpc.server.deleteServer.useMutation({
    onSuccess: () => {
      toast.success("Server deleted successfully");
      utils.server.listServerJoined.invalidate();
      utils.server.getServerById.invalidate({ serverId });
      setDeleteDialogOpen(false);
      setConfirmText("");
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete server");
    },
  });

  const leaveServer = trpc.server.leaveServer.useMutation({
    onSuccess: () => {
      toast.success("Left server successfully");
      utils.server.listServerJoined.invalidate();
      utils.server.getServerById.invalidate({ serverId });
      setLeaveDialogOpen(false);
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave server");
    },
  });

  const handleDelete = () => {
    if (confirmText === serverName) {
      deleteServer.mutate({ serverId });
    }
  };

  const handleLeave = () => {
    leaveServer.mutate({ serverId });
  };

  const isConfirmValid = confirmText === serverName;

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete &apos;{serverName}&apos;
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p className="font-semibold">
                Are you sure you want to delete <strong>{serverName}</strong>?
              </p>
              <p>
                This action cannot be undone. This will permanently delete the
                server and remove all channels, messages, and members.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-sm font-medium">
              Enter server name to confirm
            </Label>
            <Input
              id="confirm-name"
              placeholder={serverName}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Type <strong>{serverName}</strong> to confirm deletion
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || deleteServer.isPending}
            >
              {deleteServer.isPending ? "Deleting..." : "Delete Server"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Server Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Leave &apos;{serverName}&apos;</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave <strong>{serverName}</strong>? You
              won&apos;t be able to rejoin this server unless you are
              re-invited.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setLeaveDialogOpen(false)}
              disabled={leaveServer.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaveServer.isPending}
            >
              {leaveServer.isPending ? "Leaving..." : "Leave Server"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
