"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc/react";
import { useRouter } from "next/navigation";

interface LeaveServerDialogProps {
  serverId: string;
  serverName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveServerDialog({
  serverId,
  serverName,
  open,
  onOpenChange,
}: LeaveServerDialogProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const leaveServer = trpc.server.leaveServer.useMutation({
    onSuccess: () => {
      utils.server.listServerJoined.invalidate();
      utils.server.getServerById.invalidate({ serverId });
      onOpenChange(false);
      router.push("/");
    },
    // onError: (error) => {

    // },
  });

  const handleLeave = () => {
    leaveServer.mutate({ serverId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Leave &apos;{serverName}&apos;</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave <strong>{serverName}</strong>? You
            won&apos;t be able to rejoin this server unless you are re-invited.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
  );
}
