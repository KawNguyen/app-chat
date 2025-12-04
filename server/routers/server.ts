import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const serverRouter = router({
  listServerJoined: protectedProcedure.query(async ({ ctx }) => {
    const server = await prisma.server.findMany({
      where: { ownerId: ctx.user.id },
      select: {
        id: true,
        name: true,
        icon: true,
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
        serverId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const server = await prisma.server.deleteMany({
        where: {
          id: input.serverId,
          ownerId: ctx.user.id,
        },
      });
      if (server.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found or you are not the owner",
        });
      }
    }),
});
