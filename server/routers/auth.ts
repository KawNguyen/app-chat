import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Auth router - handles authentication-related operations
 */
export const authRouter = router({
  /**
   * Check if user has a password set
   */
  checkPassword: protectedProcedure.query(async ({ ctx }) => {
    const account = await prisma.account.findFirst({
      where: {
        userId: ctx.user.id,
        password: {
          not: null,
        },
      },
    });

    return { hasPassword: !!account };
  }),

  /**
   * Set password for OAuth users (first time)
   */
  setPassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a password
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: ctx.user.id,
          password: {
            not: null,
          },
        },
      });

      if (existingAccount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Account already has a password. Use change password instead.",
        });
      }

      // Use better-auth internal API to set password
      // This ensures the password is hashed correctly for better-auth
      try {
        const headersList = await headers();

        await auth.api.setPassword({
          headers: headersList,
          body: {
            newPassword: input.password,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Set password error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set password",
        });
      }
    }),
});
