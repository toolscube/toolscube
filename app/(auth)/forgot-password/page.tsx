"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputField from "@/components/shared/form-fields/input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { type ForgotPasswordData, forgotPasswordSchema } from "@/lib/validations/auth";

type ForgotPasswordFormData = ForgotPasswordData;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
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

  if (isSubmitted) {
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
