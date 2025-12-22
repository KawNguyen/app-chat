import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/types";
import { Check, X } from "lucide-react";

interface PendingRequest {
  id: string;
  sender: User;
  createdAt: Date;
}

interface PendingRequestItemProps {
  request: PendingRequest;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting: boolean;
  isDeclining: boolean;
}

export const PendingRequestItem = ({
  request,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: PendingRequestItemProps) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border group">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <UserAvatar user={request.sender} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {request.sender.displayName || request.sender.userName}
        </p>
        <p className="text-xs text-muted-foreground">Incoming Friend Request</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-background hover:bg-green-600/20 hover:text-green-600"
        title="Accept"
        onClick={onAccept}
        disabled={isAccepting}
      >
        <Check className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-background hover:bg-red-600/20 hover:text-red-600"
        title="Decline"
        onClick={onDecline}
        disabled={isDeclining}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  </div>
);
