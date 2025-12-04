"use client";

import { Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { CreateServerDialog } from "./create-server-dialog";
import { trpc } from "@/lib/trpc/react";

interface ServerListProps {
  activeServerId: string;
  onServerSelect: (serverId: string) => void;
}

export function ServerList({
  activeServerId,
  onServerSelect,
}: ServerListProps) {
  const { data: servers = [] } = trpc.server.listServerJoined.useQuery();
  return (
    <div className="w-16 border-r flex flex-col items-center py-4 gap-4">
      {/* HOME */}
      <Button className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
        <Zap className="w-6 h-6" />
      </Button>

      {/* SERVER LIST */}
      <div className="flex flex-col items-center gap-3">
        {servers.map(
          (sv: { id: string; name: string; icon: string | null }) => (
            <button
              key={sv.id}
              onClick={() => onServerSelect(sv.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-opacity
              ${activeServerId === sv.id ? "" : "opacity-70 hover:opacity-100"}
            `}
            >
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarImage src={sv.icon || ""} alt={sv.name} />
                <AvatarFallback className="rounded-lg">
                  {sv.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          )
        )}

        {/* CREATE SERVER */}
        <CreateServerDialog />
      </div>
    </div>
  );
}
