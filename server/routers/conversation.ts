import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { observable } from "@trpc/server/observable";
import { eventEmitter } from "../event-emitter";
import { DirectMessage } from "@/types";
import { notifyNewDirectMessage } from "@/lib/ws-notify";

export const conversationRouter = router({
  /**
   * List all conversations for current user
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: ctx.user.id,
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                userId: {
                  not: ctx.user.id,
                },
              },
              include: {
                user: {
                  select: {
                    id: true,
                    userName: true,
                    displayName: true,
                    image: true,
                    status: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: "desc",
        },
      },
    });

    return conversations.map((cp) => ({
      id: cp.conversation.id,
      otherUser: cp.conversation.participants[0]?.user,
      lastMessage: cp.conversation.messages[0],
      updatedAt: cp.conversation.updatedAt,
    }));
  }),

  /**
   * Get or create conversation with a user
   */
  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        otherUserId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate other user exists
      const otherUser = await prisma.user.findUnique({
        where: { id: input.otherUserId },
      });

      if (!otherUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if conversation already exists (exactly 2 participants)
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { isGroup: false },
            {
              participants: {
                some: { userId: ctx.user.id },
              },
            },
            {
              participants: {
                some: { userId: input.otherUserId },
              },
            },
            {
              participants: {
                none: {
                  userId: {
                    notIn: [ctx.user.id, input.otherUserId],
                  },
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  userName: true,
                  displayName: true,
                  image: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [{ userId: ctx.user.id }, { userId: input.otherUserId }],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  userName: true,
                  displayName: true,
                  image: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      return conversation;
    }),

  /**
   * Get conversation by ID
   */
  getConversationById: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              userId: ctx.user.id,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  userName: true,
                  displayName: true,
                  image: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      return conversation;
    }),

  /**
   * Get messages in a conversation
   */
  getConversationMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify user is part of conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              userId: ctx.user.id,
            },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const messages = await prisma.directMessage.findMany({
        where: {
          conversationId: input.conversationId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              displayName: true,
              image: true,
              status: true,
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

  /**
   * Send a message in a conversation
   */
  sendConversationMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is part of conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              userId: ctx.user.id,
            },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const message = await prisma.directMessage.create({
        data: {
          content: input.content,
          conversationId: input.conversationId,
          senderId: ctx.user.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              displayName: true,
              image: true,
              status: true,
            },
          },
          attachments: true,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      eventEmitter.emit("conversation:message:new", message);

      await notifyNewDirectMessage({
        id: message.id,
        content: message.content,
        conversationId: message.conversationId,
        senderId: message.senderId,
        createdAt: message.createdAt,
      });

      return message;
    }),

  onNewConversationMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{ message: DirectMessage }>((emit) => {
        const handler = (msg: DirectMessage) => {
          if (msg.conversationId === input.conversationId) {
            emit.next({ message: msg });
          }
        };

        eventEmitter.on("conversation:message:new", handler);

        return () => {
          eventEmitter.off("conversation:message:new", handler);
        };
      });
    }),
});
