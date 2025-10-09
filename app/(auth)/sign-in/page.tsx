"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SignInWithGoogle from "@/components/auth/sign-in-with-google";
import InputField from "@/components/shared/form-fields/input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import logger from "@/lib/logger";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else if (result?.ok) {
        toast.success("Signed in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      logger.error({ error }, "Sign in error");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center">
          <Image src="/assets/logo.png" alt="Logo" width={60} height={60} />
        </div>
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignInWithGoogle />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
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

            <InputField
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
