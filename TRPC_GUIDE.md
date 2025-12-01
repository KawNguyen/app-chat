# tRPC Setup Guide

tRPC đã được cài đặt và cấu hình sẵn trong dự án. Dưới đây là hướng dẫn sử dụng.

## 📁 Cấu trúc

```
server/
├── trpc.ts              # Khởi tạo tRPC, context, procedures
└── routers/
    ├── _app.ts         # Main app router
    └── user.ts         # User router (example)

lib/trpc/
├── index.ts            # Export utilities
├── react.ts            # React hooks
└── client.ts           # Vanilla client

app/api/trpc/[trpc]/
└── route.ts            # API route handler

providers/
└── trpc-provider.tsx   # React provider
```

## 🚀 Sử dụng trong Components

### 1. Query (GET data)

```tsx
"use client";

import { trpc } from "@/lib/trpc";

export function UserProfile() {
  const { data, isLoading, error } = trpc.user.me.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.displayName}</h1>
      <p>@{data.username}</p>
    </div>
  );
}
```

### 2. Mutation (POST/PUT/DELETE)

```tsx
"use client";

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function UpdateProfile() {
  const utils = trpc.useUtils();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      utils.user.me.invalidate(); // Refresh user data
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: { bio: string }) => {
    updateProfile.mutate(data);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({ bio: "New bio" });
      }}
    >
      <button disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### 3. Sử dụng trong Server Components

```tsx
import { trpcClient } from "@/lib/trpc";

export default async function ServerPage() {
  const users = await trpcClient.user.search.query({
    query: "john",
    limit: 10,
  });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
}
```

## 🔧 Tạo Router mới

### 1. Tạo router file

```typescript
// server/routers/message.ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import prisma from "@/lib/prisma";

export const messageRouter = router({
  // Query
  getMessages: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      return await prisma.message.findMany({
        where: { channelId: input.channelId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
    }),

  // Mutation
  sendMessage: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.message.create({
        data: {
          channelId: input.channelId,
          content: input.content,
          userId: ctx.user.id,
        },
      });
    }),
});
```

### 2. Thêm vào app router

```typescript
// server/routers/_app.ts
import { router } from "../trpc";
import { userRouter } from "./user";
import { messageRouter } from "./message";

export const appRouter = router({
  user: userRouter,
  message: messageRouter, // Add new router
});

export type AppRouter = typeof appRouter;
```

## 📚 API Examples

### User Router

```typescript
// Lấy thông tin user hiện tại
const user = await trpc.user.me.useQuery();

// Cập nhật username
trpc.user.updateUsername.mutate({ username: "newname" });

// Cập nhật profile
trpc.user.updateProfile.mutate({
  displayName: "John Doe",
  bio: "Hello world",
});

// Tìm kiếm users
const users = await trpc.user.search.query({
  query: "john",
  limit: 10,
});

// Lấy user theo ID
const user = await trpc.user.getById.query({ userId: "123" });

// Auto-generate username (OAuth)
await trpc.user.ensureUsername.mutate();
```

## 🔐 Protected vs Public Procedures

### Public Procedure

- Không cần authentication
- Dùng cho: login, register, public data

```typescript
publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
  // Anyone can call this
});
```

### Protected Procedure

- Yêu cầu authentication
- Tự động check session
- Có access đến `ctx.user`

```typescript
protectedProcedure
  .input(z.object({ bio: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user is guaranteed to exist
    const userId = ctx.user.id;
  });
```

## 🎯 Best Practices

1. **Luôn validate input với Zod**

   ```typescript
   .input(z.object({
     username: z.string().min(3).max(20),
   }))
   ```

2. **Handle errors properly**

   ```typescript
   throw new TRPCError({
     code: "NOT_FOUND",
     message: "User not found",
   });
   ```

3. **Invalidate queries sau mutations**

   ```typescript
   utils.user.me.invalidate();
   ```

4. **Sử dụng optimistic updates**
   ```typescript
   onMutate: async (newData) => {
     await utils.user.me.cancel();
     const previousData = utils.user.me.getData();
     utils.user.me.setData(undefined, newData);
     return { previousData };
   },
   ```

## 📖 Tài liệu

- [tRPC Docs](https://trpc.io)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zod Docs](https://zod.dev)
