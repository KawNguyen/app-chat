"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface AddFriendDialogProps {
  children?: React.ReactNode;
}

export function AddFriendDialog({ children }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const utils = trpc.useUtils();

  const sendRequest = trpc.friend.sendFriendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request sent!");
      setUsername("");
      setOpen(false);
      utils.friend.listPendingRequests.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send friend request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    sendRequest.mutate({ userName: username.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700 text-white"
          >
            Add Friend
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Friend
          </DialogTitle>
          <DialogDescription>
            Enter the username of the person you want to add as a friend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={sendRequest.isPending}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              You can add friends using their username.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sendRequest.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendRequest.isPending || !username.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendRequest.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
