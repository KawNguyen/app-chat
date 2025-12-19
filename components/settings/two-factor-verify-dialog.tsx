"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import QRCode from "qrcode";
import { SetPasswordForm } from "./set-password-form";
import { trpc } from "@/lib/trpc/react";

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange: () => void;
}

export function TwoFactorSetup({
  isEnabled,
  onStatusChange,
}: TwoFactorSetupProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [showSetPassword, setShowSetPassword] = useState(false);

  const { data: session } = useSession();
  const utils = trpc.useUtils();

  const { data: passwordStatus } = trpc.auth.checkPassword.useQuery(undefined, {
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (passwordStatus) {
      setHasPassword(passwordStatus.hasPassword);
    }
  }, [passwordStatus]);

  const handleEnableTwoFactor = async () => {
    if (!hasPassword) {
      setShowSetPassword(true);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSet = async () => {
    await utils.auth.checkPassword.invalidate();
    const result = await utils.auth.checkPassword.fetch();
    if (result.hasPassword) {
      setHasPassword(true);
      setShowSetPassword(false);
      setShowPasswordPrompt(true);
    }
  };

  const handleEnableWithPassword = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.twoFactor.enable({ password });

      if (response.data) {
        const qrCodeDataUrl = await QRCode.toDataURL(response.data.totpURI);
        setQrCode(qrCodeDataUrl);
        setBackupCodes(response.data.backupCodes || []);
        setShowSetup(true);
        setShowPasswordPrompt(false);
        setPassword("");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to enable 2FA"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      toast.success("2FA enabled successfully!");
      setShowSetup(false);
      setVerificationCode("");
      onStatusChange();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Invalid verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    const userPassword = prompt("Enter your password to disable 2FA:");
    if (!userPassword) return;

    setIsLoading(true);
    try {
      await authClient.twoFactor.disable({
        password: userPassword,
      });

      toast.success("2FA disabled");
      onStatusChange();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disable 2FA"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied");
  };

  // 👉 Set password first
  if (showSetPassword && !hasPassword) {
    return (
      <div className="space-y-4">
        <SetPasswordForm onSuccess={handlePasswordSet} />
        <Button
          variant="outline"
          onClick={() => setShowSetPassword(false)}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  // 👉 Password prompt
  if (showPasswordPrompt && !isEnabled) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Enable Two-Factor Authentication</AlertTitle>
          <AlertDescription>Enter your password to continue</AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEnableWithPassword();
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleEnableWithPassword} disabled={isLoading}>
            {isLoading ? "Processing..." : "Continue"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowPasswordPrompt(false);
              setPassword("");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // 👉 Not enabled yet
  if (!showSetup && !isEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-sm text-muted-foreground">
            Enhance account security with two-factor authentication
          </p>
        </div>

        {!hasPassword && (
          <Alert variant="destructive">
            <AlertTitle>Password required</AlertTitle>
            <AlertDescription>
              You need to set a password before enabling 2FA.
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleEnableTwoFactor} disabled={isLoading}>
          {!hasPassword ? "Set Password & Enable 2FA" : "Enable 2FA"}
        </Button>
      </div>
    );
  }

  // 👉 Setup step
  if (showSetup) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            Set up Two-Factor Authentication
          </h3>
          <p className="text-sm text-muted-foreground">
            Scan the QR code with your authenticator app
          </p>
        </div>

        <Separator />

        {qrCode && (
          <div className="flex justify-center">
            <div className="relative w-56 h-56">
              <Image
                src={qrCode}
                alt="QR Code"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {backupCodes.length > 0 && (
          <div className="space-y-2">
            <Label>Backup Codes</Label>
            <p className="text-sm text-muted-foreground">
              Save these codes in a safe place.
            </p>
            <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-1">
              {backupCodes.map((code, i) => (
                <div key={i}>{code}</div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={copyBackupCodes}>
              Copy Backup Codes
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Enter the verification code</Label>
          <Input
            id="verification-code"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleVerifyAndEnable} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify and Enable"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowSetup(false);
              setVerificationCode("");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // 👉 Enabled state
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Two-Factor Authentication Enabled</AlertTitle>
        <AlertDescription>Your account is protected with 2FA.</AlertDescription>
      </Alert>

      <Button
        variant="destructive"
        onClick={handleDisableTwoFactor}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Disable 2FA"}
      </Button>
    </div>
  );
}
