"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TwoFactorSetup } from "./two-factor-setup";

export function TwoFactorDialog({
  isEnabled,
  onStatusChange,
}: {
  isEnabled: boolean;
  onStatusChange: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          size={"sm"}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          {isEnabled ? "Manage 2FA" : "Enable Authenticator App"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
        </DialogHeader>

        <TwoFactorSetup
          isEnabled={isEnabled}
          onStatusChange={() => {
            onStatusChange();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
