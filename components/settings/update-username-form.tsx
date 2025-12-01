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
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/react";

export default function UpdateUsernameForm({
  currentUsername,
}: {
  currentUsername: string | null;
}) {
  const [username, setUsername] = useState(currentUsername || "");
  const utils = trpc.useUtils();

  const updateUsername = trpc.user.updateUsername.useMutation({
    onSuccess: () => {
      toast.success("Username updated successfully!");
      // Invalidate user query to refresh data
      utils.user.me.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Unable to update username");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateUsername.mutate({ username });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Username</CardTitle>
        <CardDescription>
          Change your username. Username must be unique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers and underscores"
            />
          </div>

          <Button
            type="submit"
            disabled={updateUsername.isPending}
            className="w-full"
          >
            {updateUsername.isPending ? "Updating..." : "Update"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
