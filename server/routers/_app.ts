import { router } from "../trpc";
import { categoryChannelRouter } from "./category";
import { channelRouter } from "./channel";
import { serverRouter } from "./server";
import { userRouter } from "./user";
import { friendRouter } from "./friend";
import { conversationRouter } from "./conversation";
import { messageRouter } from "./message";
import { permissionRouter } from "./permission";
import { memberRouter } from "./member";
import { authRouter } from "./auth";

export const appRouter = router({
  user: userRouter,
  server: serverRouter,
  channel: channelRouter,
  category: categoryChannelRouter,
  friend: friendRouter,
  conversation: conversationRouter,
  message: messageRouter,
  permission: permissionRouter,
  member: memberRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
