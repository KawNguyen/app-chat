"use client";

import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc/react";

interface ChannelPermission {
  channelId: string;
  channelName: string;
  channelType: string;
  isPrivate: boolean;
  categoryId: string | null;
  permissions: bigint;
  canView: boolean;
  canSend: boolean;
  canManage: boolean;
}

interface ServerPermissionsContextValue {
  isOwner: boolean;
  channelPermissionsMap: Record<string, ChannelPermission>;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    position: number;
    channels: ChannelPermission[];
  }>;
  uncategorizedChannels: ChannelPermission[];
  isLoading: boolean;
  hasChannelPermission: (channelId: string, permission: string) => boolean;
}

const ServerPermissionsContext =
  createContext<ServerPermissionsContextValue | null>(null);

interface ServerPermissionsProviderProps {
  serverId: string;
  children: ReactNode;
}

/**
 * Provider để cache permissions cho toàn bộ server
 * Chỉ cần fetch 1 lần khi vào server
 */
export function ServerPermissionsProvider({
  serverId,
  children,
}: ServerPermissionsProviderProps) {
  const { data, isLoading } = trpc.permission.getServerPermissions.useQuery(
    { serverId },
    {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache even when unmounted
      gcTime: 10 * 60 * 1000,
      // Refetch when window regains focus
      refetchOnWindowFocus: false,
    }
  );

  const hasChannelPermission = (channelId: string, permission: string) => {
    if (!data) return false;
    if (data.isOwner) return true;

    const channelPerm = data.channelPermissionsMap[channelId];
    if (!channelPerm) return false;

    // Map permission string to boolean flags
    switch (permission) {
      case "VIEW_CHANNEL":
        return channelPerm.canView;
      case "SEND_MESSAGES":
        return channelPerm.canSend;
      case "MANAGE_CHANNELS":
        return channelPerm.canManage;
      default:
        return false;
    }
  };

  const value: ServerPermissionsContextValue = {
    isOwner: data?.isOwner || false,
    channelPermissionsMap: data?.channelPermissionsMap || {},
    categories: data?.categories || [],
    uncategorizedChannels: data?.uncategorizedChannels || [],
    isLoading,
    hasChannelPermission,
  };

  return (
    <ServerPermissionsContext.Provider value={value}>
      {children}
    </ServerPermissionsContext.Provider>
  );
}

/**
 * Hook để sử dụng server permissions
 * @example
 * const { hasChannelPermission, channelPermissionsMap } = useServerPermissions();
 * const canSend = hasChannelPermission(channelId, "SEND_MESSAGES");
 */
export function useServerPermissions() {
  const context = useContext(ServerPermissionsContext);
  if (!context) {
    throw new Error(
      "useServerPermissions must be used within ServerPermissionsProvider"
    );
  }
  return context;
}

/**
 * Hook để lấy permissions của một channel cụ thể
 * @example
 * const { canView, canSend, canManage } = useChannelPermissions(channelId);
 */
export function useChannelPermissions(channelId: string) {
  const { channelPermissionsMap, isOwner } = useServerPermissions();
  const channelPerm = channelPermissionsMap[channelId];

  return {
    canView: isOwner || channelPerm?.canView || false,
    canSend: isOwner || channelPerm?.canSend || false,
    canManage: isOwner || channelPerm?.canManage || false,
    permissions: channelPerm?.permissions || 0n,
    isPrivate: channelPerm?.isPrivate || false,
  };
}
