import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { observable } from "@trpc/server/observable";
import { eventEmitter } from "../event-emitter";
import type { DirectMessage, UserStatus } from "@/types";
import { notifyNewDirectMessage } from "@/lib/ws-notify";

export const conversationRouter = router({
  /**
   * Mark conversation as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is part of conversation
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: input.conversationId,
          userId: ctx.user.id,
        },
      });

      if (!participant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Update lastReadAt to current time
      await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      });

      return { success: true };
    }),

  /**
   * List all conversations for current user
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: ctx.user.id,
        isHidden: false,
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

    const conversationsWithFriendStatus = await Promise.all(
      conversations.map(async (cp) => {
        const otherUserId = cp.conversation.participants[0]?.user?.id;
        let isFriend = false;
        let friendRequestStatus = null;

        if (otherUserId) {
          // Check if they are friends
          const friendship = await prisma.friend.findFirst({
            where: {
              userId: ctx.user.id,
              friendId: otherUserId,
            },
          });
          isFriend = !!friendship;

          // Check friend request status if not friends
          if (!isFriend) {
            const friendRequest = await prisma.friendRequest.findFirst({
              where: {
                OR: [
                  { senderId: ctx.user.id, receiverId: otherUserId },
                  { senderId: otherUserId, receiverId: ctx.user.id },
                ],
              },
              orderBy: {
                createdAt: "desc",
              },
            });

            if (friendRequest) {
              friendRequestStatus = {
                id: friendRequest.id,
                status: friendRequest.status,
                senderId: friendRequest.senderId,
                receiverId: friendRequest.receiverId,
              };
            }
          }
        }

        // Calculate unread count
        const lastReadAt = cp.lastReadAt;
        let unreadCount = 0;

        if (lastReadAt) {
          unreadCount = await prisma.directMessage.count({
            where: {
              conversationId: cp.conversation.id,
              createdAt: {
                gt: lastReadAt,
              },
              senderId: {
                not: ctx.user.id, // Don't count own messages
              },
            },
          });
        } else if (cp.conversation.messages[0]) {
          // If never read, count all messages from others
          unreadCount = await prisma.directMessage.count({
            where: {
              conversationId: cp.conversation.id,
              senderId: {
                not: ctx.user.id,
              },
            },
          });
        }

        return {
          id: cp.conversation.id,
          otherUser: cp.conversation.participants[0]?.user,
          lastMessage: cp.conversation.messages[0],
          updatedAt: cp.conversation.updatedAt,
          isFriend,
          friendRequestStatus,
          lastReadAt,
          unreadCount,
        };
      })
    );

    return conversationsWithFriendStatus;
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

      // Get the other user (for DM conversations)
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== ctx.user.id
      );
      const otherUserId = otherParticipant?.user?.id;

      let isFriend = false;
      let friendRequestStatus = null;

      if (otherUserId) {
        // Check if they are friends
        const friendship = await prisma.friend.findFirst({
          where: {
            userId: ctx.user.id,
            friendId: otherUserId,
          },
        });
        isFriend = !!friendship;

        // Check friend request status if not friends
        if (!isFriend) {
          const friendRequest = await prisma.friendRequest.findFirst({
            where: {
              OR: [
                { senderId: ctx.user.id, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: ctx.user.id },
              ],
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          if (friendRequest) {
            friendRequestStatus = {
              id: friendRequest.id,
              status: friendRequest.status,
              senderId: friendRequest.senderId,
              receiverId: friendRequest.receiverId,
            };
          }
        }
      }

      return {
        ...conversation,
        isFriend,
        friendRequestStatus,
      };
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
      })
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
        skip: input.cursor ? 1 : 0,
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
      })
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
          sender: true,
          attachments: true,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      // Explicitly emit with all data including sender
      const messageToEmit: DirectMessage = {
        id: message.id,
        content: message.content,
        conversationId: message.conversationId,
        senderId: message.senderId,
        isEdited: message.isEdited,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: {
          ...message.sender,
          status: message.sender.status as UserStatus,
        },
        attachments: message.attachments,
      };

      eventEmitter.emit("conversation:message:new", messageToEmit);

      await notifyNewDirectMessage({
        id: message.id,
        content: message.content,
        conversationId: message.conversationId,
        senderId: message.senderId,
        createdAt: message.createdAt,
      });

      return message;
    }),

  /**
   * Toggle hide/unhide conversation for current user
   */
  toggleHide: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is part of conversation
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: input.conversationId,
          userId: ctx.user.id,
        },
      });

      if (!participant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Toggle isHidden
      const updated = await prisma.conversationParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          isHidden: !participant.isHidden,
        },
      });

      return {
        success: true,
        isHidden: updated.isHidden,
      };
    }),

  onNewConversationMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
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

  /**
   * Subscribe to all new messages across all conversations for the current user
   */
  onGlobalNewMessage: protectedProcedure.subscription(({ ctx }) => {
    console.log("🎧 User subscribed to global messages:", ctx.user.id);
    return observable<{ message: DirectMessage; conversationId: string }>(
      (emit) => {
        const handler = async (msg: DirectMessage) => {
          // Check if current user is part of this conversation
          const participant = await prisma.conversationParticipant.findFirst({
            where: {
              conversationId: msg.conversationId,
              userId: ctx.user.id,
            },
          });

          // Only emit if user is part of the conversation
          if (participant) {
            // Fetch sender info if not available
            let messageWithSender = msg;
            if (!msg.sender && msg.senderId) {
              const sender = await prisma.user.findUnique({
                where: { id: msg.senderId },
                select: {
                  id: true,
                  userName: true,
                  displayName: true,
                  image: true,
                  status: true,
                },
              });

              if (sender) {
                messageWithSender = {
                  ...msg,
                };
              }
            }

            emit.next({
              message: messageWithSender,
              conversationId: msg.conversationId,
            });
          }
        };

        eventEmitter.on("conversation:message:new", handler);

        return () => {
          eventEmitter.off("conversation:message:new", handler);
        };
      }
    );
  }),
});
