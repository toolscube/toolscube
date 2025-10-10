import ForgotPasswordForm from "@/components/auth/forgot-password-form";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { token } = await searchParams;

  return <ForgotPasswordForm token={token} />;
}
