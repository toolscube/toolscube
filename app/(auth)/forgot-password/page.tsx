import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto p-6">Loading...</div>}>
      <ForgotPasswordForm token={token} />
    </Suspense>
  );
}
