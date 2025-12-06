import { UserStatus } from "@/types";
import { UserAvatar } from "@/components/user-avatar";

interface UserCardProps {
  user: {
    name: string;
    email: string;
    image?: string;
    status?: UserStatus;
  };
  currentStatus: Exclude<UserStatus, UserStatus.OFFLINE>;
}

export function UserCard({ user, currentStatus }: UserCardProps) {
  return (
    <div className="p-3 pb-2.5 rounded-t-md bg-card">
      <div className="flex items-start gap-3">
        <UserAvatar
          user={{ ...user, status: currentStatus }}
          size="lg"
          sizeStatus="5"
          showStatus
        />
      </div>

      {/* User Info */}
      <div className="mt-3 space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-foreground truncate">
            {user.name}
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
