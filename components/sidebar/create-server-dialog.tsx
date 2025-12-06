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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Upload, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";

type DialogView = "main" | "create" | "join";

export function CreateServerDialog() {
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<DialogView>("main");
  const utils = trpc.useUtils();

  const createServer = trpc.server.createServer.useMutation({
    onSuccess: () => {
      setOpen(false);
      setView("main");
      setIconPreview(null);
      utils.server.listServerJoined.invalidate();
      toast.success("Server created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create server");
    },
  });

  const joinServer = trpc.server.joinServer.useMutation({
    onSuccess: () => {
      setOpen(false);
      setView("main");
      utils.server.listServerJoined.invalidate();
      toast.success("Joined server successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join server");
    },
  });

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setIconPreview(url);
  }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await createServer.mutateAsync({
      name,
      icon: iconPreview || undefined,
      description: description || undefined,
    });
  }

  async function handleJoinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inviteCode = formData.get("inviteCode") as string;

    await joinServer.mutateAsync({ inviteCode });
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setView("main");
      setIconPreview(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        asChild
        className="rounded-full hover:bg-accent/50 flex items-center justify-center"
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent/50 flex items-center justify-center"
        >
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        {/* Main View - Choose Create or Join */}
        {view === "main" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Add a Server</DialogTitle>
              <DialogDescription>
                Create a new server or join an existing one with an invite code.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
                onClick={() => setView("create")}
              >
                <Plus className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Create My Own</div>
                  <div className="text-xs text-muted-foreground">
                    Start a new server from scratch
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
                onClick={() => setView("join")}
              >
                <Upload className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Join a Server</div>
                  <div className="text-xs text-muted-foreground">
                    Enter an invite code to join
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Create Server View */}
        {view === "create" && (
          <form className="space-y-6" onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit -ml-2"
                onClick={() => setView("main")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <DialogTitle>Create a Server</DialogTitle>
              <DialogDescription>
                Your server is where you and your friends hang out.
              </DialogDescription>
            </DialogHeader>

            {/* Upload Icon */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={iconPreview || ""} />
                <AvatarFallback>SRV</AvatarFallback>
              </Avatar>
              <Label
                htmlFor="server-icon"
                className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Upload size={16} />
                Upload Server Icon
              </Label>
              <Input
                id="server-icon"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconChange}
              />
            </div>

            {/* Server Name */}
            <div className="grid gap-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                name="name"
                placeholder="My Awesome Server"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="server-description">Description</Label>
              <Textarea
                id="server-description"
                name="description"
                placeholder="Optional description..."
                maxLength={255}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setView("main")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createServer.isPending}>
                {createServer.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Join Server View */}
        {view === "join" && (
          <form className="space-y-6" onSubmit={handleJoinSubmit}>
            <DialogHeader>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit -ml-2"
                onClick={() => setView("main")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <DialogTitle>Join a Server</DialogTitle>
              <DialogDescription>
                Enter an invite code to join an existing server.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                name="inviteCode"
                placeholder="Enter invite code"
                required
                minLength={6}
                maxLength={25}
              />
              <p className="text-xs text-muted-foreground">
                Invite codes look like: ABC123 or
                https://example.com/invite/ABC123
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setView("main")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={joinServer.isPending}>
                {joinServer.isPending ? "Joining..." : "Join Server"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
