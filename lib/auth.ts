import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
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
