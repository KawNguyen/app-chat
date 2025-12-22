"use client";

import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";

interface UserProfileDialogProps {
  user: User;
  displayName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({
  user,
  displayName,
  open,
  onOpenChange,
}: UserProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="flex flex-col">
          {/* Profile Header with Banner */}
          <div className="relative">
            {/* Banner */}
            <div className="h-[100px] bg-linear-to-br from-blue-500 via-purple-500 to-pink-500" />

            {/* Avatar */}
            <div className="absolute -bottom-10 left-4">
              <UserAvatar user={user} size="xl" showStatus sizeStatus="6" />
            </div>
          </div>

          {/* User Info */}
          <ScrollArea className="max-h-[400px]">
            <div className="mt-12 px-4 pb-4">
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <Badge variant="secondary" className="text-xs">
                    Friend
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.userName ? `@${user.userName}` : "No username"}
                </p>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      About Me
                    </p>
                    <p className="text-sm">Ngủ sớm dậy sớm :)))</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-sm">Oct 3, 2021</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-card rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Note
                </p>
                <Textarea
                  placeholder="Click to add a note"
                  className="w-full h-20 bg-background rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
