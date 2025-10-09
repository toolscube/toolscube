"use client";

import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resendVerificationEmailAction, verifyEmailAction } from "@/lib/actions/auth.action";

interface VerifyEmailFormProps {
  token?: string | null;
  email?: string | null;
}

export default function VerifyEmailForm({ token, email }: VerifyEmailFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const finalEmail = email || session?.user?.email;

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const result = await verifyEmailAction(verificationToken);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.success) {
        setIsVerified(true);
        toast.success(result.message || "Email verified successfully!");
      }
    } catch {
      const errorMessage = "Failed to verify email. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setIsLoading(false);
    }
  }, [token, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!finalEmail) {
      toast.error("Email address not found. Please sign up again.");
      router.push("/sign-up");
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationEmailAction(finalEmail);

      if (result.error) {
        toast.error(result.error);
        setError(result.error);
      } else if (result.success) {
        toast.success(result.message || "Verification email sent successfully!");
      }
    } catch {
      const errorMessage = "Failed to resend verification email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl text-center">Verifying your email</CardTitle>
          <CardDescription className="text-center">
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Email verified!</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified. You can now access all features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push("/")} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-center">Verification failed</CardTitle>
          <CardDescription className="text-center">{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={resendVerificationEmail} disabled={isResending} className="w-full">
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend verification email
          </Button>

          <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No token provided - show instruction page
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We've sent a verification link to your email address. Please check your inbox and click
          the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or click below to resend.
        </div>

        <Button
          onClick={resendVerificationEmail}
          disabled={isResending}
          variant="outline"
          className="w-full"
        >
          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend verification email
        </Button>

        <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
          Back to sign in
        </Button>
      </CardContent>
    </Card>
  );
}
