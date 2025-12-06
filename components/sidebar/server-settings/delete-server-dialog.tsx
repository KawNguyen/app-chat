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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/react";
import { useRouter } from "next/navigation";

interface DeleteServerDialogProps {
  serverId: string;
  serverName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteServerDialog({
  serverId,
  serverName,
  open,
  onOpenChange,
}: DeleteServerDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const utils = trpc.useUtils();

  const deleteServer = trpc.server.deleteServer.useMutation({
    onSuccess: () => {
      utils.server.listServerJoined.invalidate();
      utils.server.getServerById.invalidate({ serverId });
      onOpenChange(false);
      setConfirmText("");
      router.push("/");
    },
    // onError: (error) => {
    // },
  });

  const handleDelete = () => {
    if (confirmText === serverName) {
      deleteServer.mutate({ serverId });
    }
  };

  const isConfirmValid = confirmText === serverName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onOpenChange(false);
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
  );
}
