/**
 * Notify WebSocket server about events
 * This bridges Next.js API routes with the WebSocket server
 */

const WS_HTTP_URL = process.env.WS_NOTIFY_URL || "http://localhost:3002";

export async function notifyWsServer(event: string, data: unknown) {
  try {
    const response = await fetch(`${WS_HTTP_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, data }),
    });

    if (!response.ok) {
      console.error("Failed to notify WS server:", response.statusText);
    }
  } catch (error) {
    // WebSocket server might not be running in some environments
    console.warn("Could not notify WS server:", error);
  }
}

// Helper functions for specific events
export async function notifyNewMessage(message: {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  createdAt: Date;
}) {
  return notifyWsServer("message:new", message);
}

export async function notifyMessageUpdate(message: {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  createdAt: Date;
}) {
  return notifyWsServer("message:update", message);
}

export async function notifyMessageDelete(messageId: string) {
  return notifyWsServer("message:delete", messageId);
}

export async function notifyNewDirectMessage(message: {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  createdAt: Date;
}) {
  return notifyWsServer("conversation:message:new", message);
}

export async function notifyDirectMessageUpdate(message: {
  id: string;
  content: string;
  conversationId: string;
  userId: string;
  createdAt: Date;
}) {
  return notifyWsServer("conversation:message:update", message);
}

export async function notifyDirectMessageDelete(messageId: string) {
  return notifyWsServer("conversation:message:delete", messageId);
}

export async function notifyUserStatusUpdate(userId: string, status: string) {
  return notifyWsServer("user:status", { userId, status });
}

export async function notifyMemberJoin(serverId: string, userId: string) {
  return notifyWsServer("member:join", { serverId, userId });
}

export async function notifyMemberLeave(serverId: string, userId: string) {
  return notifyWsServer("member:leave", { serverId, userId });
}

export async function notifyMemberUpdate(serverId: string, memberId: string) {
  return notifyWsServer("member:update", { serverId, memberId });
}

export async function notifyFriendRequest(payload: {
  receiverId: string;
  request: {
    id: string;
    sender: {
      id: string;
      userName: string | null;
      displayName: string | null;
      image: string | null;
    };
    createdAt: Date;
  };
}) {
  return notifyWsServer("user:friend-request", payload);
}
