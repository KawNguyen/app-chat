import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/types";
import { MessageCircle, MoreVertical } from "lucide-react";

interface FriendItemProps {
  friend: User;
  currentStatus: string;
  onMessage: () => void;
  isCreatingConversation: boolean;
}

export const FriendItem = ({
  friend,
  currentStatus,
  onMessage,
  isCreatingConversation,
}: FriendItemProps) => (
  <div
    onClick={onMessage}
    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border group"
  >
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <UserAvatar user={friend} size="md" showStatus />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {friend.displayName || friend.userName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {currentStatus === "ONLINE"
            ? friend.customStatus || "Online"
            : currentStatus}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-background hover:bg-secondary"
        title="Message"
        onClick={onMessage}
        disabled={isCreatingConversation}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-background hover:bg-secondary"
        title="More"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
