/**
 * Utility để cache channel ID cuối cùng được truy cập cho mỗi server
 * và conversation ID cuối cùng cho DM
 */

const STORAGE_KEY = "server-last-channel";
const DM_STORAGE_KEY = "last-dm-conversation";

interface ServerChannelCache {
  [serverId: string]: string; // serverId -> channelId
}

/**
 * Lấy channel ID đã cache cho server
 */
export function getLastChannelForServer(serverId: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (!cache) return null;

    const parsed: ServerChannelCache = JSON.parse(cache);
    return parsed[serverId] || null;
  } catch {
    return null;
  }
}

/**
 * Lưu channel ID cho server
 */
export function setLastChannelForServer(
  serverId: string,
  channelId: string,
): void {
  if (typeof window === "undefined") return;

  try {
    const cache = localStorage.getItem(STORAGE_KEY);
    const parsed: ServerChannelCache = cache ? JSON.parse(cache) : {};

    parsed[serverId] = channelId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error("Failed to save channel cache:", error);
  }
}

/**
 * Xóa cache cho server (optional, khi user rời server)
 */
export function clearServerCache(serverId: string): void {
  if (typeof window === "undefined") return;

  try {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (!cache) return;

    const parsed: ServerChannelCache = JSON.parse(cache);
    delete parsed[serverId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error("Failed to clear channel cache:", error);
  }
}

/**
 * Lấy conversation ID cuối cùng cho DM
 */
export function getLastDMConversation(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(DM_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Lưu conversation ID cuối cùng cho DM
 */
export function setLastDMConversation(conversationId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(DM_STORAGE_KEY, conversationId);
  } catch (error) {
    console.error("Failed to save DM conversation cache:", error);
  }
}
