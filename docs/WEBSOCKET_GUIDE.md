# WebSocket Setup Guide

## Overview

WebSocket server đã được setup với TRPC subscriptions để hỗ trợ real-time messaging.

## Architecture

### Files Created:

1. **websocket-server.ts** - WebSocket server standalone
2. **server/event-emitter.ts** - Event emitter cho real-time events
3. **server/routers/message.ts** - Message router với subscriptions
4. **lib/trpc/ws-client.ts** - WebSocket client setup
5. **providers/trpc-provider.tsx** - Updated với WS support

## How to Run

### Development Mode:

**Option 1: Run both servers together**

```bash
bun run dev:all
```

**Option 2: Run separately**

```bash
# Terminal 1 - Next.js
bun run dev

# Terminal 2 - WebSocket Server
bun run dev:ws
```

### Servers:

- **Next.js App**: http://localhost:3000
- **WebSocket Server**: ws://localhost:3001

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Usage Example

### Subscribe to new messages:

```tsx
"use client";

import { trpc } from "@/lib/trpc/react";
import { useEffect } from "react";

export function ChatMessages({ channelId }: { channelId: string }) {
  const utils = trpc.useUtils();

  // Subscribe to new messages
  trpc.message.onNewMessage.useSubscription(
    { channelId },
    {
      onData: (message) => {
        console.log("New message:", message);
        // Update UI or invalidate queries
        utils.message.invalidate();
      },
    },
  );

  return <div>Messages here...</div>;
}
```

### Send a message:

```tsx
const sendMessage = trpc.message.sendMessage.useMutation({
  onSuccess: () => {
    console.log("Message sent!");
  },
});

// Usage
sendMessage.mutate({
  channelId: "channel-123",
  content: "Hello world!",
});
```

## Available Subscriptions

1. **message.onNewMessage** - Listen for new messages
2. **message.onMessageUpdate** - Listen for message edits
3. **message.onMessageDelete** - Listen for message deletions

## Features

✅ Real-time message delivery
✅ Type-safe subscriptions
✅ Automatic reconnection
✅ Event-based architecture
✅ Scalable design

## Next Steps

1. Add Message model to Prisma schema
2. Implement actual database operations in message router
3. Add user typing indicators
4. Add read receipts
5. Add file upload support

## Production Deployment

For production, you'll need to:

1. Deploy WebSocket server separately (e.g., on Railway, Render)
2. Update NEXT_PUBLIC_WS_URL to production WS URL
3. Add proper authentication to WebSocket connections
4. Implement rate limiting
5. Add monitoring and logging
