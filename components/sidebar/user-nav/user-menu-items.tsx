import { UserCircle, Users, ChevronRight, Copy } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserStatusMenu } from "./user-status-menu";
import { UserStatus } from "@/types";

interface UserMenuItemsProps {
  user: {
    email: string;
  };
  currentStatus: Exclude<UserStatus, UserStatus.OFFLINE>;
  onStatusChange: (status: Exclude<UserStatus, UserStatus.OFFLINE>) => void;
  onEditProfile: () => void;
}

export function UserMenuItems({
  user,
  currentStatus,
  onStatusChange,
  onEditProfile,
}: UserMenuItemsProps) {
  return (
    <>
      {/* Edit Profile */}
      <div className="bg-[#1e1f22] mx-4 rounded-lg overflow-hidden ">
        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer rounded px-2 py-2 text-sm"
            onClick={onEditProfile}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="my-0 mx-2" />

        {/* Status Menu */}
        <div className="p-2">
          <UserStatusMenu
            currentStatus={currentStatus}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>

      {/* Switch Accounts */}
      <div className="bg-[#1e1f22] mx-4 rounded-lg overflow-hidden mb-4">
        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer rounded px-2 py-2 text-sm justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Switch Accounts</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5" />
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Copy User ID */}
        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer rounded px-2 py-2 text-sm"
            onClick={() => navigator.clipboard.writeText(user.email)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy User ID
          </DropdownMenuItem>
        </div>
      </div>
    </>
  );
}
