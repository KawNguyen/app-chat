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

export function CreateServerDialog() {
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setIconPreview(url);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="font-medium">
          <Plus className="size-5"/>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <form className="space-y-6">
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
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="server-description">Description</Label>
            <Textarea
              id="server-description"
              name="description"
              placeholder="Optional description..."
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
