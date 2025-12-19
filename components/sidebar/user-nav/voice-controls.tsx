"use client";

import { Mic, MicOff, Headphones, HeadphoneOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useState } from "react";

interface VoiceControlsProps {
  isMuted: boolean;
  isDeafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  logout: () => void;
}

export function VoiceControls({
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  logout,
}: VoiceControlsProps) {
  const [openDialog, setOpenDialog] = useState(false);
  return (
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
              onClick={onToggleMute}
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
              onClick={onToggleDeafen}
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
              onClick={() => setOpenDialog(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>User Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SettingsDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        logout={logout}
      />
    </div>
  );
}
