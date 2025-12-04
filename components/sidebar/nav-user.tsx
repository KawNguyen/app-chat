"use client";

import {
  BadgeCheck,
  Bell,
  LogOut,
  Sparkles,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVoiceControls } from "@/hooks/use-voice-controls";

export function NavUser({
  user,
  logout,
}: {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  logout: () => void;
}) {
  const router = useRouter();

  const { isMuted, isDeafened, toggleMute, toggleDeafen } = useVoiceControls();

  return (
    <div className="flex items-center gap-1 p-1.5 bg-secondary/30 border rounded-lg overflow-hidden">
      {/* User Info */}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="hover:bg-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2 h-auto px-2 py-1.5"
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src={user.image || "/image/shadcn.jpg"}
                alt={user.name}
              />
              <AvatarFallback className="rounded-full bg-linear-to-br from-blue-400 to-purple-500 text-white font-semibold">
                {user.name?.slice(0, 2).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-xs font-semibold text-foreground truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                #{user.email.split("@")[0]}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side="top"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-linear-to-br from-blue-400 to-purple-500 text-white font-semibold">
                  {user.name?.slice(0, 2).toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              router.push("/sign-in");
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Voice Controls */}
      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          {/* Mic Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  isMuted
                    ? "text-destructive hover:text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isMuted ? "Bật mic" : "Tắt mic"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Headphone/Deafen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  isDeafened
                    ? "text-destructive hover:text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={toggleDeafen}
              >
                {isDeafened ? (
                  <HeadphoneOff className="h-4 w-4" />
                ) : (
                  <Headphones className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isDeafened ? "Bật âm thanh" : "Tắt âm thanh"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Cài đặt người dùng</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
