import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const friendRouter = router({
  /**
   * List all friends
   */
  listFriends: protectedProcedure.query(async ({ ctx }) => {
    const friends = await prisma.friend.findMany({
      where: {
        userId: ctx.user.id,
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
            status: true,
            customStatus: true,
          },
        },
      },
    });

    return friends.map((f) => f.friend);
  }),

  /**
   * List pending friend requests
   */
  listPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: ctx.user.id,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests;
  }),

  /**
   * Send friend request
   */
  sendFriendRequest: protectedProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find user by username
      const receiver = await prisma.user.findUnique({
        where: { username: input.username },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (receiver.id === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot send a friend request to yourself",
        });
      }

      // Check if already friends
      const existingFriendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: ctx.user.id, friendId: receiver.id },
            { userId: receiver.id, friendId: ctx.user.id },
          ],
        },
      });

      if (existingFriendship) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already friends",
        });
      }

      // Check for existing pending request
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: ctx.user.id, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: ctx.user.id },
          ],
          status: "PENDING",
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Friend request already exists",
        });
      }

      // Create friend request
      const request = await prisma.friendRequest.create({
        data: {
          senderId: ctx.user.id,
          receiverId: receiver.id,
        },
      });

      return request;
    }),

  /**
   * Accept friend request
   */
  acceptFriendRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.friendRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.receiverId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Friend request not found",
        });
      }

      // Create friendship (both directions)
      await prisma.$transaction([
        prisma.friend.create({
          data: {
            userId: ctx.user.id,
            friendId: request.senderId,
          },
        }),
        prisma.friend.create({
          data: {
            userId: request.senderId,
            friendId: ctx.user.id,
          },
        }),
        prisma.friendRequest.update({
          where: { id: input.requestId },
          data: { status: "ACCEPTED" },
        }),
      ]);

      return { success: true };
    }),

  /**
   * Decline friend request
   */
  declineFriendRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.friendRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.receiverId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Friend request not found",
        });
      }

      await prisma.friendRequest.update({
        where: { id: input.requestId },
        data: { status: "DECLINED" },
      });

      return { success: true };
    }),

  /**
   * Remove friend
   */
  removeFriend: protectedProcedure
    .input(
      z.object({
        friendId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.friend.deleteMany({
        where: {
          OR: [
            { userId: ctx.user.id, friendId: input.friendId },
            { userId: input.friendId, friendId: ctx.user.id },
          ],
        },
      });

      return { success: true };
    }),
});
