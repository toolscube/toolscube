"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, KeyRound, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import InputField from "@/components/shared/form-fields/input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { forgotPasswordAction, resetPasswordAction } from "@/lib/actions/auth.action";
import { type ForgotPasswordData, forgotPasswordSchema } from "@/lib/validations/auth";

type ForgotPasswordFormData = ForgotPasswordData;

// Reset password form schema (with confirm password)
const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction(data);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.message || "Reset link sent successfully!");
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsResetting(true);

    try {
      const result = await resetPasswordAction({
        token,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.message || "Password reset successfully!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isSuccess) {
    // Show success page after password reset
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Password Updated</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully updated. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push("/sign-in")} className="w-full">
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (token && !isSuccess) {
    // Show reset password form if we have a token
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <InputField
                name="password"
                label="New Password"
                type="password"
                placeholder="Enter new password"
                disabled={isResetting}
                value={resetForm.watch("password")}
                onChange={(e) => resetForm.setValue("password", e.target.value)}
              />

              <InputField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                disabled={isResetting}
                value={resetForm.watch("confirmPassword")}
                onChange={(e) => resetForm.setValue("confirmPassword", e.target.value)}
              />

              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </Form>

          <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    // Show email sent confirmation
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a password reset link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-primary underline underline-offset-4 hover:no-underline"
              type="button"
            >
              try again
            </button>
          </div>

          <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show forgot password form (default state)
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Forgot password?</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...forgotForm}>
          <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              value={forgotForm.watch("email")}
              onChange={(e) => forgotForm.setValue("email", e.target.value)}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </form>
        </Form>

        <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </CardContent>
    </Card>
  );
}
