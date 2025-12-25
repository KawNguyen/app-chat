import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/types";

interface HeaderCardChatAreaProps {
  user: User;
  isFriend?: boolean;
  friendRequestStatus?: string;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  isPending?: boolean;
}

export function HeaderCardChatArea({
  user,
  isFriend,
  friendRequestStatus,
  onAddFriend,
  onRemoveFriend,
  isPending,
}: HeaderCardChatAreaProps) {
  return (
    <div className="flex flex-col justify-center px-4">
      <UserAvatar user={user} size="lg" />
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {user?.displayName || user?.userName}
      </h3>
      <p className="leading-7 not-first:mt-4 text-muted-foreground">
        This is the beginning of your direct message history with{" "}
        <span className="font-semibold text-white">
          {user.userName || user.displayName}
        </span>
      </p>
      <Button
        disabled={isPending || friendRequestStatus === "PENDING"}
        type="button"
        className={`w-max mt-4 text-white ${
          isFriend
            ? "bg-red-400 hover:bg-red-500"
            : "bg-indigo-500 hover:bg-indigo-600"
        }`}
        onClick={isFriend ? onRemoveFriend : onAddFriend}
      >
        {isFriend
          ? "Remove Friend"
          : friendRequestStatus === "PENDING"
            ? "Request Sent"
            : "Add Friend"}
      </Button>
    </div>
  );
}
