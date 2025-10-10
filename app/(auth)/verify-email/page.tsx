import VerifyEmailForm from "@/components/auth/verify-email-form";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token, email } = await searchParams;
  return <VerifyEmailForm token={token} email={email} />;
}
