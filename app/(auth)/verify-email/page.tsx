import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/verify-email-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
    email?: string;
  };
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
            <CardDescription className="text-center">Please wait...</CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <VerifyEmailForm token={searchParams.token} email={searchParams.email} />
    </Suspense>
  );
}
