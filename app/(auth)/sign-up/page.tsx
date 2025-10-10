"use client";

import Image from "next/image";
import Link from "next/link";
import SignInWithGoogle from "@/components/auth/sign-in-with-google";
import SignUpForm from "@/components/auth/sign-up-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center">
          <Image src="/assets/logo.png" alt="Logo" width={60} height={60} />
        </div>
        <CardTitle className="text-2xl text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to create your account
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

        <SignUpForm />

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
