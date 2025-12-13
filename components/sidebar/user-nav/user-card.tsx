import { UserStatus } from "@/types";
import { UserAvatar } from "@/components/user-avatar";

interface UserCardProps {
  user: {
    userName: string;
    displayName: string;
    email: string;
    image?: string;
    status?: UserStatus;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="p-3 pb-2.5 rounded-t-md bg-card">
      <div className="flex items-start gap-3">
        <UserAvatar user={{ ...user }} size="lg" sizeStatus="5" showStatus />
      </div>

      {/* User Info */}
      <div className="mt-3 space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-foreground truncate">
            {user.displayName ? user.displayName : user.userName}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {user.email.split("@")[0]}
        </div>
      </div>

      {/* Custom Status */}
      <div className="mt-2 text-xs text-muted-foreground italic border-t pt-2 whitespace-pre-line">
        &ldquo;Nhiệm vụ nào cũng hoàn thành{"\n"}Khó khăn nào cũng vượt qua
        {"\n"}Kẻ thù nào cũng đánh thắng&rdquo;
      </div>
    </div>
  );
}
