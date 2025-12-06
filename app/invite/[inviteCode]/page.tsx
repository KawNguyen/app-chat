"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const joinServer = trpc.server.joinServer.useMutation({
    onSuccess: () => {
      toast.success("Successfully joined the server!");
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join server");
      router.push("/");
    },
  });

  useEffect(() => {
    if (inviteCode) {
      joinServer.mutate({ inviteCode });
    }
  }, [inviteCode, joinServer]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Joining server...</p>
      </div>
    </div>
  );
}
