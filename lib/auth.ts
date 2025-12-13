import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        const { sendPasswordResetEmail } = await import("@/lib/email");
        await sendPasswordResetEmail(user.email, url);
      } catch (error) {
        logger.warn(
          { url, email: user.email },
          "Password reset email not sent (email not configured). Reset URL:"
        );
        console.log(`\n🔐 Password Reset Link: ${url}\n`);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: env.auth.google.clientId || "",
      clientSecret: env.auth.google.clientSecret || "",
      enabled: !!(env.auth.google.clientId && env.auth.google.clientSecret),
    },
  },
  secret: env.auth.secret,
  baseURL: env.auth.url,
  trustedOrigins: [env.app.siteUrl, env.app.url],
});
