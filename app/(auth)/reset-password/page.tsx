"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, KeyRound, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import InputField from "@/components/shared/form-fields/input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { resetPasswordAction } from "@/lib/actions/auth";

const resetPasswordSchema = z
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      setIsValidToken(false);
    }
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      // For now, just assume token is valid
      // In real app, you would validate with the server
      setIsValidToken(true);
    } catch (error) {
      console.error("Token validation error:", error);
      setIsValidToken(false);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl text-center">Validating token</CardTitle>
          <CardDescription className="text-center">
            Please wait while we validate your reset token...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isValidToken) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-center">Invalid token</CardTitle>
          <CardDescription className="text-center">
            This password reset link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push("/forgot-password")} className="w-full">
            Request new reset link
          </Button>

          <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Password reset!</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully reset. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push("/sign-in")} className="w-full">
            Continue to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Reset password</CardTitle>
        <CardDescription className="text-center">Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="password"
              label="New Password"
              type="password"
              placeholder="Create a strong password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <InputField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your new password"
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
