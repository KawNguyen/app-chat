import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { UserStatus } from "@/types";
import { observable } from "@trpc/server/observable";
import { eventEmitter } from "../event-emitter";
import { notifyUserStatusUpdate } from "@/lib/ws-notify";

/**
 * User router - handles user-related operations
 */
export const userRouter = router({
  /**
   * Get current user information
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        userName: true,
        displayName: true,
        image: true,
        banner: true,
        bio: true,
        status: true,
        customStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  getById: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          userName: true,
          displayName: true,
          image: true,
          banner: true,
          bio: true,
          status: true,
          customStatus: true,
          createdAt: true,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return user;
    }),

  /**
   * Update username
   */
  updateUsername: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username cannot exceed 20 characters")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores",
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if username is already in use
      const existingUser = await prisma.user.findFirst({
        where: {
          userName: input.username,
          NOT: {
            id: ctx.user.id,
          },
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username is already taken",
        });
      }

      // Update username
      const updatedUser = await prisma.user.update({
        where: { id: ctx.user.id },
        data: { userName: input.username },
        select: {
          id: true,
          userName: true,
        },
      });

      return updatedUser;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum([
          UserStatus.ONLINE,
          UserStatus.OFFLINE,
          UserStatus.IDLE,
          UserStatus.DND,
          UserStatus.INVISIBLE,
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        where: { id: ctx.user.id },
        data: { status: input.status },
        select: {
          id: true,
          status: true,
        },
      });

      // Emit local event
      eventEmitter.emit("user:status", {
        userId: ctx.user.id,
        status: input.status,
      });

      // Notify WebSocket server (cross-process)
      await notifyUserStatusUpdate(ctx.user.id, input.status);

      return updatedUser;
    }),

  onStatusUpdate: publicProcedure
    .input(
      z.object({
        userIds: z.array(z.string()), // danh sách userId muốn theo dõi
      }),
    )
    .subscription(({ input }) => {
      return observable<{ userId: string; status: string }>((emit) => {
        const onStatus = (
          data: { userId: string; status: string } | string,
          status?: string,
        ) => {
          // Handle both formats: (userId, status) and ({ userId, status })
          const userId = typeof data === "string" ? data : data.userId;
          const statusValue = typeof data === "string" ? status! : data.status;

          // Chỉ emit nếu user này nằm trong danh sách đang theo dõi
          if (input.userIds.includes(userId)) {
            emit.next({
              userId: userId,
              status: statusValue,
            });
          }
        };

        eventEmitter.on("user:status", onStatus);

        return () => {
          eventEmitter.off("user:status", onStatus);
        };
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().max(50).optional(),
        bio: z.string().max(500).optional(),
        image: z.string().url().optional().or(z.literal("")),
        banner: z.string().url().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          displayName: input.displayName,
          bio: input.bio,
          image: input.image || null,
          banner: input.banner || null,
        },
        select: {
          id: true,
          displayName: true,
          bio: true,
          image: true,
          banner: true,
        },
      });

      return updatedUser;
    }),

  /**
   * Search users
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              userName: {
                contains: input.query,
                mode: "insensitive",
              },
            },
            {
              displayName: {
                contains: input.query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          userName: true,
          displayName: true,
          image: true,
          status: true,
        },
        take: input.limit,
      });

      return users;
    }),
});
