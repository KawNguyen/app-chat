import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
export const memberRouter = router({
  listMemberInChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      const members = await prisma.member.findMany({
        where: { server: { id: input.channelId } },
        select: {
          id: true,
          nickname: true,
        },
      });
      return members;
    }),
});
