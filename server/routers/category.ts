import prisma from "@/lib/prisma";
import { protectedProcedure, router } from "../trpc";
import z from "zod";

export const categoryChannelRouter = router({
  listCategoryInServer: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input }) => {
      const categories = await prisma.category.findMany({
        where: { serverId: input.serverId },
        select: {
          id: true,
          name: true,
          position: true,
        },
      });
      return categories;
    }),
});
