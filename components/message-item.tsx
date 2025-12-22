"use client";

import { UserAvatar } from "@/components/user-avatar";
import Image from "next/image";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { UserProfilePopover } from "./user-profile-popover";
import { MessageContextMenu } from "./chat/components/message-context-menu";
import Link from "next/link";
import { DirectMessage, Message, User } from "@/types";

interface MessageItemProps {
  message: DirectMessage | Message;
  currentUserId?: string;
  showAvatar: boolean;
  formatTimestamp: (date: Date) => string;
  onProfileClick?: (user: User) => void;
}

export function MessageItem({
  message,
  currentUserId,
  showAvatar,
  formatTimestamp,
  onProfileClick,
}: MessageItemProps) {
  // Determine user info from either sender or member structure
  const user =
    ((message as DirectMessage).sender as User) ||
    (message as Message).member?.user;
  const isCurrentUser = currentUserId && user?.id === currentUserId;
  const displayName =
    (message as Message).member?.nickname ||
    user?.displayName ||
    user?.userName ||
    (isCurrentUser ? "You" : "User");

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="group">
            <div
              className={`flex items-center gap-4 hover:bg-accent/30 -mx-2 px-2 rounded transition-colors py-0.5`}
            >
              {showAvatar ? (
                <UserProfilePopover
                  user={user!}
                  displayName={displayName}
                  side="right"
                >
                  <div className="cursor-pointer w-10 flex items-center justify-center">
                    <UserAvatar user={user!} size="md" />
                  </div>
                </UserProfilePopover>
              ) : (
                <div className="w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {showAvatar && (
                  <div className="flex items-baseline gap-2">
                    <UserProfilePopover
                      user={user!}
                      displayName={displayName}
                      side="right"
                    >
                      <p className="font-semibold text-[15px] text-foreground hover:underline cursor-pointer">
                        {displayName}
                      </p>
                    </UserProfilePopover>
                    <p className="text-[11px] text-muted-foreground">
                      {formatTimestamp(message.createdAt)}
                    </p>
                  </div>
                )}
                <p className="text-foreground text-[14px] leading-5.5 whitespace-pre-wrap wrap-break-word">
                  {message.content}
                  {message.isEdited && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      (edited)
                    </span>
                  )}
                </p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => {
                      if (attachment.type.startsWith("image/")) {
                        return (
                          <Image
                            key={attachment.id}
                            src={attachment.url}
                            alt={attachment.name}
                            width={400}
                            height={300}
                            className="rounded max-w-sm max-h-80 object-cover"
                          />
                        );
                      }
                      return (
                        <Link
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-accent rounded text-sm hover:bg-accent/80 transition-colors"
                        >
                          📎 {attachment.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ContextMenuTrigger>

        <MessageContextMenu onProfileClick={() => onProfileClick?.(user!)} />
      </ContextMenu>
    </>
  );
}
