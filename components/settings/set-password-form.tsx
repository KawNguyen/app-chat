"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/react";

interface SetPasswordFormProps {
  onSuccess: () => void;
  hasPassword?: boolean;
}

export function SetPasswordForm({
  onSuccess,
  hasPassword = false,
}: SetPasswordFormProps) {
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
        // Change existing password using better-auth
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
        // Set password for the first time using tRPC
        await setPasswordMutation.mutateAsync({
          password: newPassword,
        });

        toast.success("Password set successfully!");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (error: unknown) {
      console.error("Password error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {hasPassword ? "Change Password" : "Set Account Password"}
        </CardTitle>
        <CardDescription>
          {hasPassword
            ? "Update your account password"
            : "Set a password for your account to enable two-factor authentication and other security features."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPassword && (
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading
            ? "Processing..."
            : hasPassword
            ? "Change Password"
            : "Set Password"}
        </Button>
      </CardContent>
    </Card>
  );
}
