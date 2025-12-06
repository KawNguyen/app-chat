import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import z from "zod";

export const channelRouter = router({
  getChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const channel = await prisma.channel.findUnique({
        where: { id: input.channelId },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          serverId: true,
        },
      });
      return channel;
    }),

  listChannel: protectedProcedure.query(async ({ ctx }) => {
    const channels = await prisma.channel.findMany({
      where: { serverId: ctx.user.id },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
      },
    });
    return channels;
  }),

  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        categoryId: z.enum(["text", "voice"]),
        serverId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const channel = await prisma.channel.create({
        data: {
          name: input.name,
          categoryId: input.categoryId.toUpperCase(),
          serverId: input.serverId,
        },
      });
      return channel;
    }),
});
