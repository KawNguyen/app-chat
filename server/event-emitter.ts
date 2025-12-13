import { DirectMessage } from "@/types";
import EventEmitter from "events";

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  createdAt: Date;
}

// 1) Tạo bảng type mapping cho tất cả events
type Events = {
  "message:new": Message;
  "message:update": Message;
  "message:delete": string;

  "member:join": { serverId: string; userId: string };
  "member:leave": { serverId: string; userId: string };
  "member:update": { serverId: string; memberId: string };

  "user:status": { userId: string; status: string };
  "user:friend-request": {
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
  };

  "conversation:message:new": DirectMessage;
  "direct-message:update": DirectMessage;
  "direct-message:delete": string;
};

// 2) Class EventEmitter type-safe
class MyEventEmitter extends EventEmitter {
  // ---- on() type-safe ----
  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    return super.on(event, listener);
  }

  // ---- emit() type-safe ----
  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    return super.emit(event, payload);
  }
}

// 3) Export Singleton
export const eventEmitter = new MyEventEmitter();
