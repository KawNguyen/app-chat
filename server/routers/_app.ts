import { router } from "../trpc";
import { serverRouter } from "./server";
import { userRouter } from "./user";

export const appRouter = router({
  user: userRouter,
  server: serverRouter,
});

export type AppRouter = typeof appRouter;
