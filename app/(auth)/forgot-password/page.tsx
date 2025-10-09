import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

interface ForgotPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto p-6">Loading...</div>}>
      <ForgotPasswordForm token={searchParams.token} />
    </Suspense>
  );
}
