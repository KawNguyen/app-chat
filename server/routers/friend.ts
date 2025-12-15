import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { eventEmitter } from "../event-emitter";
import { observable } from "@trpc/server/observable";
import { notifyFriendRequest } from "@/lib/ws-notify";

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
            userName: true,
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
            userName: true,
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
        userName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find user by username
      const receiver = await prisma.user.findUnique({
        where: { userName: input.userName },
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

      // Check for existing request
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: ctx.user.id, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: ctx.user.id },
          ],
        },
      });

      if (existingRequest) {
        // If receiver already sent a request to sender, auto-accept it
        if (
          existingRequest.senderId === receiver.id &&
          existingRequest.receiverId === ctx.user.id &&
          existingRequest.status === "PENDING"
        ) {
          // Check if conversation already exists
          const existingConversation = await prisma.conversation.findFirst({
            where: {
              AND: [
                {
                  participants: {
                    some: { userId: ctx.user.id },
                  },
                },
                {
                  participants: {
                    some: { userId: receiver.id },
                  },
                },
                {
                  participants: {
                    none: {
                      userId: {
                        notIn: [ctx.user.id, receiver.id],
                      },
                    },
                  },
                },
              ],
            },
          });

          // Auto-accept the request and create friendship
          await prisma.$transaction(async (tx) => {
            // Create friendships
            await tx.friend.createMany({
              data: [
                {
                  userId: ctx.user.id,
                  friendId: receiver.id,
                },
                {
                  userId: receiver.id,
                  friendId: ctx.user.id,
                },
              ],
            });

            // Update request status
            await tx.friendRequest.update({
              where: { id: existingRequest.id },
              data: { status: "ACCEPTED" },
            });

            // Create conversation if it doesn't exist
            if (!existingConversation) {
              await tx.conversation.create({
                data: {
                  participants: {
                    create: [{ userId: ctx.user.id }, { userId: receiver.id }],
                  },
                },
              });
            }
          });

          return {
            id: existingRequest.id,
            sender: {
              id: receiver.id,
              userName: receiver.userName,
              displayName: receiver.displayName,
              image: receiver.image,
            },
            createdAt: existingRequest.createdAt,
          };
        }

        // If there's a pending request from sender to receiver
        if (existingRequest.status === "PENDING") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Friend request already exists",
          });
        }

        // If there's an old request (DECLINED/ACCEPTED), delete it and create a new one
        await prisma.friendRequest.delete({
          where: { id: existingRequest.id },
        });
      }

      // Create new friend request
      const request = await prisma.friendRequest.create({
        data: {
          senderId: ctx.user.id,
          receiverId: receiver.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              displayName: true,
              image: true,
            },
          },
        },
      });

      const payload = {
        receiverId: receiver.id,
        request: {
          id: request.id,
          sender: request.sender,
          createdAt: request.createdAt,
        },
      };

      // Emit event for real-time notification
      eventEmitter.emit("user:friend-request", payload);

      await notifyFriendRequest(payload);

      return request;
    }),

  /**
   * Subscribe to friend requests for the current user
   */
  onFriendRequest: protectedProcedure.subscription(({ ctx }) => {
    return observable<{
      id: string;
      sender: {
        id: string;
        userName: string | null;
        displayName: string | null;
        image: string | null;
      };
      createdAt: Date;
    }>((emit) => {
      const handler = (payload: {
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
      }) => {
        // Only emit to the receiver of the friend request
        if (payload.receiverId === ctx.user.id) {
          emit.next(payload.request);
        }
      };

      eventEmitter.on("user:friend-request", handler);

      return () => {
        eventEmitter.off("user:friend-request", handler);
      };
    });
  }),

  /**
   * Accept friend request
   */
  acceptFriendRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.friendRequest.findUnique({
        where: { id: input.requestId },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              displayName: true,
              image: true,
              status: true,
              customStatus: true,
            },
          },
        },
      });

      if (!request || request.receiverId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Friend request not found",
        });
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: { userId: ctx.user.id },
              },
            },
            {
              participants: {
                some: { userId: request.senderId },
              },
            },
            {
              participants: {
                none: {
                  userId: {
                    notIn: [ctx.user.id, request.senderId],
                  },
                },
              },
            },
          ],
        },
      });

      // Create friendship (both directions) and conversation
      let conversationId = existingConversation?.id;

      await prisma.$transaction(async (tx) => {
        // Create friendships
        await tx.friend.createMany({
          data: [
            {
              userId: ctx.user.id,
              friendId: request.senderId,
            },
            {
              userId: request.senderId,
              friendId: ctx.user.id,
            },
          ],
        });

        // Update request status
        await tx.friendRequest.update({
          where: { id: input.requestId },
          data: { status: "ACCEPTED" },
        });

        // Create conversation if it doesn't exist
        if (!existingConversation) {
          const conversation = await tx.conversation.create({
            data: {
              participants: {
                create: [{ userId: ctx.user.id }, { userId: request.senderId }],
              },
            },
          });

          conversationId = conversation.id;
        }
      });

      return {
        success: true,
        friend: request.sender,
        conversationId,
      };
    }),

  /**
   * Decline friend request
   */
  declineFriendRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      }),
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
      }),
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
