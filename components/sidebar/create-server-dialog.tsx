"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { Plus, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc/react";

export function CreateServerDialog() {
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const createServer = trpc.server.createServer.useMutation({
    onSuccess: () => {
      setOpen(false);
      // Reset form
      setIconPreview(null);
      utils.server.listServerJoined.invalidate();
    },
  });

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setIconPreview(url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          <DialogHeader>
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
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createServer.isPending}>
              {createServer.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
