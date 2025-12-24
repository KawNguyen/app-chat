import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, UserStatus } from "@/types";

interface UserAvatarProps {
  user: User;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  sizeStatus?: "3.5" | "4" | "5" | "6";
  className?: string;
  fallbackClassName?: string;
  showStatus?: boolean;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
  "2xl": "h-18 w-18",
  "3xl": "h-22 w-22",
};

const fallbackSizeClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const statusConfig = {
  ONLINE: "bg-green-500",
  IDLE: "bg-yellow-500",
  DND: "bg-red-500",
  INVISIBLE: "bg-gray-500",
  OFFLINE: "bg-gray-500",
};

const sizeStatusClasses = {
  "3.5": "size-3.5 -bottom-0.5 -right-0.5",
  "4": "size-4 bottom-0 right-0",
  "5": "size-5 bottom-0 right-0",
  "6": "size-5.5 bottom-0.5 right-0.5",
};

export function UserAvatar({
  user,
  size = "md",
  sizeStatus = "3.5",
  className,
  fallbackClassName,
  showStatus = false,
}: UserAvatarProps) {
  const displayName = user?.displayName || user?.userName || "U";
  const initials = displayName.slice(0, 2).toUpperCase();
  const userStatus = (user?.status as UserStatus) || UserStatus.OFFLINE;

  return (
    <div className="relative inline-block w-max h-max">
      <Avatar className={cn("rounded-full", sizeClasses[size], className)}>
        <AvatarImage src={user?.image || ""} alt={displayName} />
        <AvatarFallback
          className={cn(
            "rounded-full bg-blue-700 text-white font-semibold",
            fallbackSizeClasses[size],
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <div
          className={`absolute ${sizeStatusClasses[sizeStatus]} rounded-full border-[3px] border-background bg-background`}
        >
          <div
            className={cn(
              "w-full h-full rounded-full",
              statusConfig[userStatus]
            )}
          />
        </div>
      )}
    </div>
  );
}
