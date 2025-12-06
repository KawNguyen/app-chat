import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const serverRouter = router({
  listServerJoined: protectedProcedure.query(async ({ ctx }) => {
    const servers = await prisma.server.findMany({
      where: { members: { some: { userId: ctx.user.id } } },
      select: {
        id: true,
        name: true,
        icon: true,
      },
    });
    if (!servers) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Server not found",
      });
    }
    return servers;
  }),

  getServerById: protectedProcedure
    .input(z.object({ serverId: z.string().cuid() }))
    .query(async ({ input }) => {
      const server = await prisma.server.findUnique({
        where: { id: input.serverId },
        include: {
          categories: {
            include: {
              channels: true,
            },
          },
        },
      });
      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }
      return server;
    }),

  joinServer: protectedProcedure
    .input(
      z.object({
        inviteCode: z.string().min(6).max(25),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const server = await prisma.server.findUnique({
        where: { inviteCode: input.inviteCode },
      });
      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }
      await prisma.member.create({
        data: {
          userId: ctx.user.id,
          serverId: server.id,
        },
      });
    }),

  createServer: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        icon: z.string().url().optional(),
        description: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newServer = await prisma.server.create({
        data: {
          name: input.name,
          icon: input.icon,
          description: input.description,
          isPublic: true,
          owner: {
            connect: { id: ctx.user.id },
          },
          members: {
            create: {
              userId: ctx.user.id,
            },
          },
        },
      });

      await prisma.category.create({
        data: {
          name: "TEXT CHANNELS",
          position: 0,
          serverId: newServer.id,
          channels: {
            create: [
              {
                name: "general",
                type: "TEXT",
                position: 0,
                serverId: newServer.id,
              },
            ],
          },
        },
      });

      await prisma.category.create({
        data: {
          name: "VOICE CHANNELS",
          position: 1,
          serverId: newServer.id,
          channels: {
            create: [
              {
                name: "General",
                type: "VOICE",
                position: 0,
                serverId: newServer.id,
              },
            ],
          },
        },
      });

      const serverWithData = await prisma.server.findUnique({
        where: { id: newServer.id },
        include: {
          categories: {
            include: {
              channels: true,
            },
          },
        },
      });

      return serverWithData;
    }),

  updateServer: protectedProcedure
    .input(
      z.object({
        serverId: z.string().uuid(),
        name: z.string().min(3).max(100).optional(),
        icon: z.string().url().optional(),
        description: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const server = await prisma.server.updateMany({
        where: {
          id: input.serverId,
          ownerId: ctx.user.id,
        },
        data: {
          name: input.name,
          icon: input.icon,
          description: input.description,
        },
      });
      if (server.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found or you are not the owner",
        });
      }
    }),

  deleteServer: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership first
      const server = await prisma.server.findFirst({
        where: {
          id: input.serverId,
          ownerId: ctx.user.id,
        },
      });

      if (!server) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Server not found or you are not the owner",
        });
      }

      // Delete in correct order to avoid foreign key constraints
      // 1. Delete all channels
      await prisma.channel.deleteMany({
        where: { serverId: input.serverId },
      });

      // 2. Delete all categories
      await prisma.category.deleteMany({
        where: { serverId: input.serverId },
      });

      // 3. Delete all members
      await prisma.member.deleteMany({
        where: { serverId: input.serverId },
      });

      // 4. Finally delete the server
      await prisma.server.delete({
        where: { id: input.serverId },
      });

      return { success: true };
    }),

  leaveServer: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.member.deleteMany({
        where: {
          serverId: input.serverId,
          userId: ctx.user.id,
        },
      });
      return { success: true };
    }),

  getInviteCode: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const member = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: ctx.user.id,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this server",
        });
      }

      const server = await prisma.server.findUnique({
        where: { id: input.serverId },
        select: { inviteCode: true },
      });

      return server?.inviteCode || null;
    }),

  regenerateInviteCode: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const server = await prisma.server.findFirst({
        where: {
          id: input.serverId,
          ownerId: ctx.user.id,
        },
      });

      if (!server) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the owner of this server",
        });
      }

      // Generate new random invite code
      const newInviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      await prisma.server.update({
        where: { id: input.serverId },
        data: { inviteCode: newInviteCode },
      });

      return newInviteCode;
    }),

  inviteUser: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if requester is a member
      const requesterMember = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: ctx.user.id,
        },
      });

      if (!requesterMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this server",
        });
      }

      // Check if user is already a member
      const existingMember = await prisma.member.findFirst({
        where: {
          serverId: input.serverId,
          userId: input.userId,
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this server",
        });
      }

      // Create new member
      await prisma.member.create({
        data: {
          userId: input.userId,
          serverId: input.serverId,
        },
      });

      return { success: true };
    }),
});
