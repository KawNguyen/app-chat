"use client";

import { Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CreateServerDialog } from "./create-server-dialog";
import { useEffect, useRef, useState } from "react";
import { Server } from "@/types";

interface ServerListProps {
  servers: Server[];
  activeServerId: string | null; // null = Zap/DM mode
  onServerSelect: (serverId: string | null) => void;
}

export function ServerList({
  servers,
  activeServerId,
  onServerSelect,
}: ServerListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [indicatorPos, setIndicatorPos] = useState({ top: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Khi activeServerId là null, tìm nút Zap
    const targetId = activeServerId === null ? "zap" : activeServerId;
    const activeEl = containerRef.current.querySelector(
      `button[data-id="${targetId}"]`
    ) as HTMLElement | null;

    if (activeEl) {
      const rect = activeEl.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();

      setIndicatorPos({
        top: rect.top - parentRect.top,
        height: rect.height,
      });
    }
  }, [activeServerId, servers]);

  return (
    <div className="relative w-16 h-full border-r flex flex-col items-center py-4 gap-4">
      {/* Indicator Line */}
      <div
        className="absolute left-0 bg-primary rounded-r-md transition-all duration-300 ease-out"
        style={{
          width: "4px",
          height: `${indicatorPos.height}px`,
          transform: `translateY(${indicatorPos.top}px)`,
        }}
      />

      {/* SERVER LIST */}
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-3 relative w-full"
      >
        {/* ZAP - Direct Messages / Home */}
        <button
          data-id="zap"
          onClick={() => onServerSelect(null)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-muted
            ${
              activeServerId === null
                ? "opacity-100"
                : "opacity-70 hover:opacity-100"
            }
          `}
        >
          <Zap className="w-5 h-5" />
        </button>

        {/* Separator */}
        <div className="w-8 h-0.5 bg-border rounded-full" />

        {/* SERVERS */}
        {servers.map(
          (sv: { id: string; name: string; icon: string | null }) => (
            <button
              key={sv.id}
              data-id={sv.id}
              onClick={() => onServerSelect(sv.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-opacity
              ${
                activeServerId === sv.id
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              }
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
