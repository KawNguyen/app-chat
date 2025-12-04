"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  serverMembers,
  getAvatarGradient,
  type ServerMember,
  type UserStatus,
} from "@/constants";

const StatusIndicator = ({ status }: { status: UserStatus }) => {
  const statusConfig = {
    ONLINE: "bg-green-500",
    IDLE: "bg-yellow-500",
    DND: "bg-red-500",
    INVISIBLE: "bg-gray-500",
    OFFLINE: "bg-gray-500",
  };

  return (
    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-background bg-background">
      <div className={cn("w-full h-full rounded-full", statusConfig[status])} />
    </div>
  );
};

const MemberItem = ({ member }: { member: ServerMember }) => {
  const displayName = member.nickname || member.user.name;
  const avatarGradient = getAvatarGradient(member.userId);
  const highestRole = member.roles.sort((a, b) => b.position - a.position)[0];

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 mx-2 rounded cursor-pointer",
        "hover:bg-accent/30 transition-colors"
      )}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.user.image} alt={displayName} />
          <AvatarFallback
            className={cn("text-sm font-semibold text-white", avatarGradient)}
          >
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <StatusIndicator status={member.user.status} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-medium truncate",
              member.user.status === "OFFLINE"
                ? "text-muted-foreground"
                : "text-foreground"
            )}
            style={highestRole?.color ? { color: highestRole.color } : {}}
          >
            {displayName}
          </span>
        </div>
      </div>
    </div>
  );
};

const ListMember = () => {
  // Helper: Check if member is active (online, idle, dnd)
  const isActive = (status: UserStatus) =>
    status === "ONLINE" || status === "IDLE" || status === "DND";

  // Group members by role
  const membersByRole = serverMembers.reduce(
    (acc, member) => {
      const highestRole = member.roles.sort(
        (a, b) => b.position - a.position
      )[0];
      const roleKey = highestRole ? highestRole.name : "Online";

      if (!acc[roleKey]) {
        acc[roleKey] = {
          role: highestRole || {
            name: "Online",
            color: undefined,
            position: -1,
          },
          active: [],
          offline: [],
        };
      }

      if (isActive(member.user.status)) {
        acc[roleKey].active.push(member);
      } else {
        acc[roleKey].offline.push(member);
      }

      return acc;
    },
    {} as Record<
      string,
      {
        role: { name: string; color?: string; position: number };
        active: ServerMember[];
        offline: ServerMember[];
      }
    >
  );

  // Sort roles by position (highest first)
  const sortedRoles = Object.values(membersByRole).sort(
    (a, b) => b.role.position - a.role.position
  );

  return (
    <div className="flex flex-col h-full w-60 bg-background border-l">
      <ScrollArea className="flex-1">
        <div className="py-4">
          {sortedRoles.map(({ role, active, offline }) => (
            <div key={role.name} className="mb-4">
              {/* Role Header - Active Members */}
              {active.length > 0 && (
                <div className="mb-3">
                  <h3
                    className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: role.color || "rgb(var(--muted-foreground))",
                    }}
                  >
                    {role.name === "Online" ? "Online" : role.name} —{" "}
                    {active.length}
                  </h3>
                  <div className="space-y-0.5">
                    {active.map((member) => (
                      <MemberItem key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {/* Role Header - Offline Members */}
              {offline.length > 0 && (
                <div className="mb-3">
                  <h3
                    className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: role.color || "rgb(var(--muted-foreground))",
                    }}
                  >
                    {role.name === "Online" ? "Offline" : role.name} —{" "}
                    {offline.length}
                  </h3>
                  <div className="space-y-0.5">
                    {offline.map((member) => (
                      <MemberItem key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ListMember;
