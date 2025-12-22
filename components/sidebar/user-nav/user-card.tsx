import { User } from "@/types";
import { UserAvatar } from "@/components/user-avatar";

interface UserCardProps {
  user: User;
  showBio?: boolean;
}

export function UserCard({ user, showBio }: UserCardProps) {
  return (
    <div className="rounded-t-md bg-card mb-2">
      <div
        className={`h-28 w-full relative flex items-start gap-3 ${user.banner} mb-14`}
      >
        <div
          className={`h-full w-full ${
            user.banner ? user.banner : `bg-blue-700`
          }`}
        ></div>
        <div className="absolute -bottom-12 left-4 h-max w-max rounded-full border-4 border-card">
          <UserAvatar user={{ ...user }} size="xl" sizeStatus="5" showStatus />
        </div>
      </div>

      {/* User Info */}
      <div className="mt-3 mx-4">
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-foreground truncate">
            {user.displayName ? user.displayName : user.userName}
          </span>
        </div>
        <span className="text-[12px] text-muted-foreground truncate">
          {user.userName}
        </span>
      </div>

      {/* Custom Status */}
      {user.bio && showBio && (
        <div
          className={`mt-2 mx-4 text-xs text-muted-foreground italic whitespace-pre-line`}
        >
          {user.bio}
        </div>
      )}
    </div>
  );
}
