"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import QRCode from "qrcode";
import { CheckCircle2 } from "lucide-react";

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange: () => void;
  hasPassword?: boolean;
}

export function TwoFactorSetup({
  isEnabled,
  onStatusChange,
  hasPassword = true,
}: TwoFactorSetupProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showDisablePrompt, setShowDisablePrompt] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const handleEnableTwoFactor = async () => {
    if (!hasPassword) {
      toast.error("You need to set a password before enabling 2FA");
      return;
    }
    setShowPasswordPrompt(true);
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
        error instanceof Error ? error.message : "Failed to enable 2FA",
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
      await authClient.twoFactor.verifyTotp({ code: verificationCode });

      toast.success("2FA enabled successfully!");
      setShowSetup(false);
      setVerificationCode("");
      onStatusChange();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Invalid verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!disablePassword) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.twoFactor.disable({ password: disablePassword });

      toast.success("2FA disabled");
      setShowDisablePrompt(false);
      setDisablePassword("");
      onStatusChange();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disable 2FA",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied");
  };

  // Password prompt
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
            className="focus-visible:border-ring focus-visible:ring-0"
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

  // Not enabled yet
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

        <Button
          onClick={handleEnableTwoFactor}
          disabled={!hasPassword || isLoading}
        >
          {!hasPassword ? "Set a password first" : "Enable 2FA"}
        </Button>
      </div>
    );
  }

  // Setup step
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

  if (showDisablePrompt && isEnabled) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Disable Two-Factor Authentication</AlertTitle>
          <AlertDescription>
            Enter your password to disable 2FA. This will reduce your account
            security.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="disable-password">Password</Label>
          <Input
            id="disable-password"
            type="password"
            placeholder="Enter your password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDisableTwoFactor}
            disabled={isLoading}
          >
            {isLoading ? "Disabling..." : "Confirm Disable"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowDisablePrompt(false);
              setDisablePassword("");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Enabled state
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Your account security settings
        </p>
      </div>

      <Alert className="w-full border-green-500/50 bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:border-green-400/50 dark:text-green-400">
        <CheckCircle2 className="h-5 w-5" />
        <AlertTitle className="text-green-600 dark:text-green-400">
          Two-Factor Authentication is Active
        </AlertTitle>
        <AlertDescription className="text-green-600/80 dark:text-green-400/80">
          Your account is protected with an additional layer of security.
          You&apos;ll need to enter a code from your authenticator app when
          signing in.
        </AlertDescription>
      </Alert>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Authentication Method</p>
            <p className="text-sm text-muted-foreground">
              Authenticator app (TOTP)
            </p>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
            Active
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Security Tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Keep your backup codes in a safe place</li>
            <li>Don&apos;t share your authenticator app access</li>
            <li>Use a password manager for added security</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={() => setShowDisablePrompt(true)}
          disabled={isLoading}
        >
          Disable 2FA
        </Button>
      </div>
    </div>
  );
}
