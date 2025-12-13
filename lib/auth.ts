import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async after(ctx: any) {
      console.log("After callback - path:", ctx.path, "method:", ctx.method);

      // Kiểm tra nhiều điều kiện khác nhau
      if (ctx.method === "POST" && ctx.context?.user) {
        const user = ctx.context.user;
        console.log("User data:", user);

        // Nếu user vừa được tạo và có name nhưng chưa có username
        if (user.name && !user.username) {
          console.log("Updating username and displayName for user:", user.id);

          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                userName: user.name, // name từ form signup chính là username
                displayName: user.name,
              },
            });
            console.log("Successfully updated username and displayName");
          } catch (error) {
            console.error("Error updating user:", error);
          }
        }
      }
      return ctx;
    },
  },
});
