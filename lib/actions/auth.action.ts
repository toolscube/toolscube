"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ZodError } from "zod";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  type ForgotPasswordData,
  forgotPasswordSchema,
  type ResetPasswordData,
  resetPasswordSchema,
  type SignUpData,
  signUpSchema,
} from "@/lib/validations/auth";

// Sign up
export async function signUpAction(data: SignUpData) {
  try {
    const validatedData = signUpSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token: verificationToken,
        expires,
        userId: user.id,
      },
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: `
        <h1>Welcome to Tools Cube!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}">
          Verify Email Address
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return {
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    if (error instanceof ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

// Forgot password action
export async function forgotPasswordAction(data: ForgotPasswordData) {
  try {
    const validatedData = forgotPasswordSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      };
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: resetToken,
        expires,
        userId: user.id,
      },
    });

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return {
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error instanceof ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

// Reset password action
export async function resetPasswordAction(data: ResetPasswordData) {
  try {
    const validatedData = resetPasswordSchema.parse(data);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: "Invalid or expired reset token" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

// Verify email action
export async function verifyEmailAction(token: string) {
  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { error: "Invalid or expired verification token" };
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    });

    // Delete used verification token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// Resend verification email action
export async function resendVerificationEmailAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.emailVerified) {
      return { error: "Email is already verified" };
    }

    // Delete existing verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token: verificationToken,
        expires,
        userId: user.id,
      },
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}">
          Verify Email Address
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Resend verification email error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
