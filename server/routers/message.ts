import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { eventEmitter } from "../event-emitter";
import { observable } from "@trpc/server/observable";
import { notifyNewMessage } from "@/lib/ws-notify";

export const messageRouter = router({
  // Get messages by channel ID
  getMessages: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        where: {
          channelId: input.channelId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              displayName: true,
              image: true,
            },
          },
          member: {
            select: {
              id: true,
              nickname: true,
            },
          },
          attachments: true,
        },
      });

      let nextCursor: string | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find member for this user in the server
      const channel = await prisma.channel.findUnique({
        where: { id: input.channelId },
        select: { serverId: true },
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.user.id,
          serverId: channel.serverId,
        },
      });

      if (!member) {
        throw new Error("You are not a member of this server");
      }

      const message = await prisma.message.create({
        data: {
          content: input.content,
          channelId: input.channelId,
          userId: ctx.user.id,
          memberId: member.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              displayName: true,
              image: true,
            },
          },
          member: {
            select: {
              id: true,
              nickname: true,
            },
          },
          attachments: true,
        },
      });

      // Emit event for real-time updates (local - for same process)
      eventEmitter.emit("message:new", {
        id: message.id,
        content: message.content,
        channelId: message.channelId,
        userId: message.userId,
        createdAt: message.createdAt,
      });

      // Notify WebSocket server (cross-process communication)
      await notifyNewMessage({
        id: message.id,
        content: message.content,
        channelId: message.channelId,
        userId: message.userId,
        createdAt: message.createdAt,
      });

      return message;
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the message
      const message = await prisma.message.findUnique({
        where: { id: input.messageId },
      });

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.userId !== ctx.user.id) {
        throw new Error("You can only delete your own messages");
      }

      await prisma.message.delete({
        where: { id: input.messageId },
      });

      return { success: true };
    }),

  // Update a message
  updateMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the message
      const message = await prisma.message.findUnique({
        where: { id: input.messageId },
      });

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.userId !== ctx.user.id) {
        throw new Error("You can only edit your own messages");
      }

      const updatedMessage = await prisma.message.update({
        where: { id: input.messageId },
        data: {
          content: input.content,
          isEdited: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      return updatedMessage;
    }),

  // Subscribe to new messages in a channel
  onNewMessage: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
      })
    )
    .subscription(({ input }) => {
      return observable<typeof input & { messageId: string }>((emit) => {
        const onMessage = (message: {
          id: string;
          channelId: string;
          userId: string;
          content: string;
          createdAt: Date;
        }) => {
          if (message.channelId === input.channelId) {
            emit.next({
              channelId: message.channelId,
              messageId: message.id,
            });
          }
        };

        eventEmitter.on("message:new", onMessage);

        return () => {
          eventEmitter.off("message:new", onMessage);
        };
      });
    }),
});
