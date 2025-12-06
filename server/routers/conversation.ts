import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

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
                    username: true,
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: [ctx.user.id, input.otherUserId],
              },
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
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
                  username: true,
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
      })
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
                  username: true,
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
});
