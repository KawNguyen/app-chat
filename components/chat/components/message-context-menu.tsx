"use client";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  UserIcon,
  MessageSquareIcon,
  PhoneIcon,
  StickyNoteIcon,
  UserPlusIcon,
  PencilIcon,
  SettingsIcon,
  UserXIcon,
  EyeOffIcon,
  BanIcon,
  ShieldIcon,
  ClockIcon,
  LogOutIcon,
  CopyIcon,
} from "lucide-react";

interface MessageContextMenuProps {
  onProfileClick: () => void;
}

export function MessageContextMenu({
  onProfileClick,
}: MessageContextMenuProps) {
  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem onClick={onProfileClick}>
        <UserIcon className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <MessageSquareIcon className="mr-2 h-4 w-4" />
        <span>Mention</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <MessageSquareIcon className="mr-2 h-4 w-4" />
        <span>Message</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <PhoneIcon className="mr-2 h-4 w-4" />
        <span>Call</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <StickyNoteIcon className="mr-2 h-4 w-4" />
        <span>Add Note</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <UserPlusIcon className="mr-2 h-4 w-4" />
        <span>Add Friend</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <PencilIcon className="mr-2 h-4 w-4" />
        <span>Change Nickname</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <SettingsIcon className="mr-2 h-4 w-4" />
          <span>Apps</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>App 1</ContextMenuItem>
          <ContextMenuItem>App 2</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuItem>
        <UserPlusIcon className="mr-2 h-4 w-4" />
        <span>Invite to Server</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem className="text-destructive">
        <UserXIcon className="mr-2 h-4 w-4" />
        <span>Remove Friend</span>
      </ContextMenuItem>
      <ContextMenuItem className="text-destructive">
        <EyeOffIcon className="mr-2 h-4 w-4" />
        <span>Ignore</span>
      </ContextMenuItem>
      <ContextMenuItem className="text-destructive">
        <BanIcon className="mr-2 h-4 w-4" />
        <span>Block</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <ShieldIcon className="mr-2 h-4 w-4" />
        <span>Open in Mod View</span>
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger className="text-destructive">
          <ClockIcon className="mr-2 h-4 w-4" />
          <span>Timeout</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>60 seconds</ContextMenuItem>
          <ContextMenuItem>5 minutes</ContextMenuItem>
          <ContextMenuItem>10 minutes</ContextMenuItem>
          <ContextMenuItem>1 hour</ContextMenuItem>
          <ContextMenuItem>1 day</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuItem className="text-destructive">
        <LogOutIcon className="mr-2 h-4 w-4" />
        <span>Kick</span>
      </ContextMenuItem>
      <ContextMenuItem className="text-destructive">
        <BanIcon className="mr-2 h-4 w-4" />
        <span>Ban</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <CopyIcon className="mr-2 h-4 w-4" />
        <span>Copy User ID</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
