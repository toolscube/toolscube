import { createAuthClient } from "better-auth/react";
import { env } from "./env";

const baseURL =
  typeof window !== "undefined"
    ? env.app.url || window.location.origin
    : env.app.siteUrl || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Password reset functions using Better Auth's API
export const forgetPassword = async ({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) => {
  try {
    const response = await fetch(`${baseURL}/api/auth/request-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirectTo }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: { message: errorData.message || "Failed to send reset email" },
      };
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  } catch (error) {
    return { error: { message: "Network error. Please try again." } };
  }
};

export const resetPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  try {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: { message: errorData.message || "Failed to reset password" },
      };
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  } catch (error) {
    return { error: { message: "Network error. Please try again." } };
  }
};
