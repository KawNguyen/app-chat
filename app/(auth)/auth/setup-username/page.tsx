"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function SetupUsernamePage() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const utils = trpc.useUtils();

  const updateUsername = trpc.user.updateUsername.useMutation({
    onSuccess: () => {
      toast.success("Username set successfully!");
      utils.user.me.invalidate();
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set username");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (username.length > 20) {
      toast.error("Username cannot exceed 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers and underscores");
      return;
    }

    updateUsername.mutate({ username });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Choose Your Username
        </CardTitle>
        <CardDescription className="text-center">
          Pick a unique username for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={updateUsername.isPending}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers and underscores only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={updateUsername.isPending || !username.trim()}
          >
            {updateUsername.isPending ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Setting username...
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
