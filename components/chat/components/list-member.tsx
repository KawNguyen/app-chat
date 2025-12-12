"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type UserStatus } from "@/types";
import { UserAvatar } from "../../user-avatar";
import { trpc } from "@/lib/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useUserStatus } from "@/providers/user-status-provider";

interface MemberRole {
  id: string;
  name: string;
  color?: string | null;
  position: number;
}

interface MemberUser {
  id: string;
  name: string;
  username?: string | null;
  image?: string | null;
  status: UserStatus;
}

interface ServerMember {
  id: string;
  oderId?: string;
  serverId: string;
  nickname?: string | null;
  user: MemberUser;
  roles: MemberRole[];
}

function MemberItem({ member }: { member: ServerMember }) {
  const { getUserStatus } = useUserStatus();
  const displayName = member.nickname || member.user.name;
  const highestRole = [...member.roles].sort(
    (a, b) => b.position - a.position,
  )[0];

  // Get status from global provider, fallback to member data
  const userStatus = getUserStatus(member.user.id) || member.user.status;

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 mx-2 rounded cursor-pointer",
        "hover:bg-accent/30 transition-colors",
      )}
    >
      <UserAvatar
        user={{ ...member.user, status: userStatus }}
        size="md"
        sizeStatus="4"
        showStatus
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-medium truncate",
              userStatus === "OFFLINE"
                ? "text-muted-foreground"
                : "text-foreground",
            )}
            style={highestRole?.color ? { color: highestRole.color } : {}}
          >
            {displayName}
          </span>
        </div>
      </div>
    </div>
  );
}

function MemberListSkeleton() {
  return (
    <div className="flex flex-col h-full w-60 bg-background border-l">
      <div className="py-4 px-4 space-y-4">
        <Skeleton className="h-4 w-24" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ListMemberProps {
  serverId: string;
}

export function ListMember({ serverId }: ListMemberProps) {
  const utils = trpc.useUtils();
  const { getUserStatus, setMultipleStatuses } = useUserStatus();
  const { data: members, isLoading } = trpc.member.getServerMembers.useQuery(
    { serverId },
    {
      enabled: !!serverId,
      staleTime: Infinity,
    },
  );

  // Initialize global status cho members khi load
  useEffect(() => {
    if (members) {
      const statuses = members.map((m) => ({
        userId: m.user.id,
        status: m.user.status as UserStatus,
      }));
      setMultipleStatuses(statuses);
    }
  }, [members, setMultipleStatuses]);

  trpc.member.onMemberListUpdate.useSubscription(
    { serverId },
    {
      onData: async () => {
        await utils.member.getServerMembers.invalidate({ serverId });
      },
    },
  );
  // Helper: Check if member is active (online, idle, dnd)
  const isActive = (status: UserStatus) =>
    status === "ONLINE" || status === "IDLE" || status === "DND";

  if (isLoading) {
    return <MemberListSkeleton />;
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col h-full w-60 bg-background border-l">
        <div className="py-4 px-4 text-center text-muted-foreground">
          No members found
        </div>
      </div>
    );
  }

  // Group members by role using global status
  const membersByRole = members.reduce(
    (acc, member) => {
      const highestRole = [...member.roles].sort(
        (a, b) => b.position - a.position,
      )[0];
      const roleKey = highestRole ? highestRole.name : "Online";

      if (!acc[roleKey]) {
        acc[roleKey] = {
          role: highestRole || {
            id: "default",
            name: "Online",
            color: undefined,
            position: -1,
          },
          active: [] as ServerMember[],
          offline: [] as ServerMember[],
        };
      }

      // Use global status
      const currentStatus = getUserStatus(member.user.id) || member.user.status;
      if (isActive(currentStatus as UserStatus)) {
        acc[roleKey].active.push(member as ServerMember);
      } else {
        acc[roleKey].offline.push(member as ServerMember);
      }

      return acc;
    },
    {} as Record<
      string,
      {
        role: {
          id?: string;
          name: string;
          color?: string | null;
          position: number;
        };
        active: ServerMember[];
        offline: ServerMember[];
      }
    >,
  );

  // Sort roles by position (highest first)
  const sortedRoles = Object.values(membersByRole).sort(
    (a, b) => b.role.position - a.role.position,
  );

  return (
    <div className="flex flex-col h-full w-full bg-background border-l">
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
}
