"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Copy, Check, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";

interface InviteDialogProps {
  serverId: string;
  serverName: string;
}

export function InviteDialog({ serverId, serverName }: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const utils = trpc.useUtils();

  const { data: inviteCode } = trpc.server.getInviteCode.useQuery(
    { serverId },
    { enabled: open },
  );

  const { data: searchResults } = trpc.user.search.useQuery(
    { query: searchQuery, limit: 5 },
    { enabled: searchQuery.length >= 2 },
  );

  const inviteUser = trpc.server.inviteUser.useMutation({
    onSuccess: () => {
      toast.success("Invite sent successfully!");
      setSearchQuery("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send invite");
    },
  });

  const regenerateCode = trpc.server.regenerateInviteCode.useMutation({
    onSuccess: () => {
      utils.server.getInviteCode.invalidate({ serverId });
      toast.success("Invite code regenerated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to regenerate code");
    },
  });

  const inviteLink = inviteCode ? `${inviteCode}` : "";

  function handleCopy() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleInviteUser(userId: string) {
    inviteUser.mutate({ serverId, userId });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite people to {serverName}</DialogTitle>
          <DialogDescription>
            Share this link or search for friends to invite them to your server.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Link Section */}
          <div className="space-y-3">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="flex-1" />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => regenerateCode.mutate({ serverId })}
                disabled={regenerateCode.isPending}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    regenerateCode.isPending ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your invite link expires never and has unlimited uses.
            </p>
          </div>

          {/* Search Users Section */}
          <div className="space-y-3">
            <Label>Or invite a friend</Label>
            <Input
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {searchResults && searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                            {user.userName?.slice(0, 2).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {user.displayName || user.userName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.userName}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInviteUser(user.id)}
                          disabled={inviteUser.isPending}
                        >
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
