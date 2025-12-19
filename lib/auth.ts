import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
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
  user: {
    additionalFields: {
      userName: {
        type: "string",
        required: false,
        input: true,
      },
      displayName: {
        type: "string",
        required: false,
      },
    },
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async after(ctx: any) {
      console.log("After callback - path:", ctx.path, "method:", ctx.method);

      // Check if this is a sign up request
      if (ctx.path === "/sign-up/email" && ctx.method === "POST") {
        const user = ctx.context?.user;
        if (user && user.name) {
          console.log("Updating username and displayName for user:", user.id);

          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                userName: user.name,
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
  appName: "ConTalk",
  plugins: [
    twoFactor({
      issuer: "ConTalk",
      skipVerificationOnEnable: false,
    }),
  ],
});
