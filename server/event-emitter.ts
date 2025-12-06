import EventEmitter from "events";

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  createdAt: Date;
}

class MyEventEmitter extends EventEmitter {
  // Type-safe event emitter
  on(event: "message:new", listener: (message: Message) => void): this;
  on(event: "message:update", listener: (message: Message) => void): this;
  on(event: "message:delete", listener: (messageId: string) => void): this;
  on(
    event: "member:join",
    listener: (data: { serverId: string; userId: string }) => void
  ): this;
  on(
    event: "member:leave",
    listener: (data: { serverId: string; userId: string }) => void
  ): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  emit(event: "message:new", message: Message): boolean;
  emit(event: "message:update", message: Message): boolean;
  emit(event: "message:delete", messageId: string): boolean;
  emit(
    event: "member:join",
    data: { serverId: string; userId: string }
  ): boolean;
  emit(
    event: "member:leave",
    data: { serverId: string; userId: string }
  ): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

export const eventEmitter = new MyEventEmitter();
