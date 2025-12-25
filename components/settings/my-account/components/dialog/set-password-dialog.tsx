"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/react";

interface SetPasswordFormProps {
  onSuccess: () => void;
  hasPassword?: boolean;
}

export function SetPasswordDialog({
  onSuccess,
  hasPassword = false,
}: SetPasswordFormProps) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setPasswordMutation = trpc.auth.setPassword.useMutation();

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (hasPassword && !currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (hasPassword) {
        const result = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });

        if (result.error) {
          toast.error(result.error.message || "Failed to change password");
          return;
        }

        toast.success("Password changed successfully!");
      } else {
        await setPasswordMutation.mutateAsync({
          password: newPassword,
        });

        toast.success("Password set successfully!");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess();
      setOpen(false);
    } catch (error: unknown) {
      console.error("Password error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          size={"sm"}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          {hasPassword ? "Change Password" : "Set Password"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-md">
        <DialogHeader>
          <DialogTitle>
            {hasPassword ? "Change Password" : "Set Account Password"}
          </DialogTitle>
          <DialogDescription>
            {hasPassword
              ? "Update your account password"
              : "Set a password for your account to enable two-factor authentication and other security features."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="current-password">
                Current Password <p className="text-orange-500">*</p>
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                required
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">
              New Password <p className="text-orange-500">*</p>
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirm Password <p className="text-orange-500">*</p>
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              minLength={8}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2 justify-end mt-4">
            <Button
              variant={"secondary"}
              className="border"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={"default"}
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-500/90 text-white"
            >
              {isLoading
                ? "Processing..."
                : hasPassword
                  ? "Change Password"
                  : "Set Password"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
