import { env } from "@/lib/env";
import nodemailer from "nodemailer";
import logger from "./logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create transporter
const createTransporter = () => {
  const config = {
    host: env.email.host,
    port: env.email.port,
    secure: false,
    auth: {
      user: env.email.user,
      pass: env.email.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(config);
};

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: env.email.from,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error({ error }, "Email sending failed");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${env.auth.url}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ToolsCube</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header with Logo and Brand -->
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
          <img src="${env.auth.url}/assets/logo.png" alt="ToolsCube Logo" style="width: 60px; height: 60px; margin-bottom: 16px; border-radius: 12px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">ToolsCube</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Your All-in-One Tools Platform</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
              </svg>
            </div>
            <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Welcome to ToolsCube!</h2>
            <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
              Thank you for verifying your email address. Click the button below to activate your account.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.39); transition: all 0.2s;">
              ✉️ Verify Email Address
            </a>
          </div>

          <!-- Alternative Link -->
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #475569; margin: 0 0 12px 0; font-size: 14px; font-weight: 500;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin: 0; word-break: break-all;">
              <a href="${verifyUrl}" style="color: #8b5cf6; text-decoration: none; font-size: 14px;">${verifyUrl}</a>
            </p>
          </div>

          <!-- Security Info -->
          <div style="border-left: 4px solid #fbbf24; background-color: #fffbeb; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              🔒 This link is valid for 24 hours. If you did not request this email, please ignore it.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">
            Made with ❤️ by <strong style="color: #8b5cf6;">ToolsCube Team</strong>
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © 2025 ToolsCube. All rights reserved.
          </p>
          <div style="margin-top: 16px;">
            <a href="https://toolscube.app" style="color: #8b5cf6; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
            <a href="https://toolscube.app/privacy" style="color: #8b5cf6; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy</a>
            <a href="https://toolscube.app/terms" style="color: #8b5cf6; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms</a>
          </div>
        </div>
      </div>
      
      <!-- Email client compatibility styles -->
      <div style="display: none; max-height: 0; overflow: hidden;">
        Welcome to ToolsCube! Please verify your email address to get started with our amazing tools platform.
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "🚀 Verify Your Email Address - ToolsCube",
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${env.auth.url}/forgot-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ToolsCube</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header with Logo and Brand -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
          <img src="${env.auth.url}/assets/logo.png" alt="ToolsCube Logo" style="width: 60px; height: 60px; margin-bottom: 16px; border-radius: 12px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">ToolsCube</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="white"/>
              </svg>
            </div>
            <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
            <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
              You have requested a password reset for your ToolsCube account. Click the button below to set a new password.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39); transition: all 0.2s;">
              🔐 Reset Password
            </a>
          </div>

          <!-- Alternative Link -->
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #475569; margin: 0 0 12px 0; font-size: 14px; font-weight: 500;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin: 0; word-break: break-all;">
              <a href="${resetUrl}" style="color: #ef4444; text-decoration: none; font-size: 14px;">${resetUrl}</a>
            </p>
          </div>

          <!-- Security Warning -->
          <div style="border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #991b1b; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
              🚨 Security Notice:
            </p>
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">
                • This link is valid for 1 hour only<br>
                • If you have not requested a password reset, please ignore this email<br>
                • Keep your password strong for security
            </p>
          </div>

          <!-- Additional Help -->
          <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
              💡 <strong>Need Help?</strong> Contact us at: support@toolscube.app
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">
            Made with ❤️ by <strong style="color: #ef4444;">ToolsCube Team</strong>
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © 2025 ToolsCube. All rights reserved.
          </p>
          <div style="margin-top: 16px;">
            <a href="https://toolscube.app" style="color: #ef4444; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
            <a href="https://toolscube.app/privacy" style="color: #ef4444; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy</a>
            <a href="https://toolscube.app/terms" style="color: #ef4444; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms</a>
          </div>
        </div>
      </div>
      
      <!-- Email client compatibility styles -->
      <div style="display: none; max-height: 0; overflow: hidden;">
        Reset your ToolsCube password securely. Click the link to create a new password for your account.
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "🔐 Reset Your Password - ToolsCube",
    html,
  });
};
