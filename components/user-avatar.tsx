import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { UserStatus } from "@/types";

interface UserAvatarProps {
  user: {
    name?: string | null;
    username?: string | null;
    displayName?: string | null;
    image?: string | null;
    status?: string | UserStatus;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  sizeStatus?: string;
  className?: string;
  fallbackClassName?: string;
  showStatus?: boolean;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

const fallbackSizeClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-xl",
};

const statusConfig = {
  ONLINE: "bg-green-500",
  IDLE: "bg-yellow-500",
  DND: "bg-red-500",
  INVISIBLE: "bg-gray-500",
  OFFLINE: "bg-gray-500",
};

export function UserAvatar({
  user,
  size = "md",
  sizeStatus = "3.5",
  className,
  fallbackClassName,
  showStatus = false,
}: UserAvatarProps) {
  const displayName = user.displayName || user.username || user.name || "U";
  const initials = displayName.slice(0, 2).toUpperCase();
  const userStatus = (user.status as UserStatus) || UserStatus.OFFLINE;

  return (
    <div className="relative inline-block">
      <Avatar className={cn("rounded-full", sizeClasses[size], className)}>
        <AvatarImage src={user.image || ""} alt={displayName} />
        <AvatarFallback
          className={cn(
            "rounded-full bg-blue-700 text-white font-semibold",
            fallbackSizeClasses[size],
            fallbackClassName,
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {showStatus && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 size-${sizeStatus} rounded-full border-[3px] border-background bg-background`}
        >
          <div
            className={cn(
              "w-full h-full rounded-full",
              statusConfig[userStatus],
            )}
          />
        </div>
      )}
    </div>
  );
}
