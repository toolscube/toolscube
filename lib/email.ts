import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create transporter with correct environment variables
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // For development only
    },
  };

  console.log("Email config:", {
    host: config.host,
    port: config.port,
    user: config.auth.user,
    hasPassword: !!config.auth.pass,
  });

  return nodemailer.createTransport(config);
};

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@toolscube.app",
      to,
      subject,
      html,
    };

    console.log(`Sending email to: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
      <p style="color: #666; font-size: 16px;">
        Thanks for signing up! Please click the button below to verify your email address.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" 
           style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #999; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <a href="${verifyUrl}" style="color: #007cba;">${verifyUrl}</a>
      </p>
      <p style="color: #999; font-size: 14px;">
        This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email Address - ToolsCube",
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/password-reset?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="color: #666; font-size: 16px;">
        You requested a password reset. Click the button below to create a new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #999; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <a href="${resetUrl}" style="color: #dc3545;">${resetUrl}</a>
      </p>
      <p style="color: #999; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - ToolsCube",
    html,
  });
};