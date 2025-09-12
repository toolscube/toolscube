"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="transition-colors duration-200">
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12 md:flex-row md:gap-12 lg:gap-16">
          <div className="w-full max-w-md space-y-6 md:w-1/2">
            <div className="relative">
              <Image
                src="/error/404.png"
                width={400}
                height={400}
                alt="404 error illustration"
                className="mx-auto mb-6"
                priority
              />
              <div className="space-y-4 text-center">
                <h1 className="mb-4 text-2xl font-bold sm:text-3xl">Oops! Page Not Found</h1>
                <p className="dark:text-medium-bg mb-6 text-base sm:text-lg">
                  Sorry, the page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you
                  back on track!
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="cursor-pointer rounded-md px-6 py-2 font-bold"
                >
                  Back to Homepage
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md md:w-1/2">
            <Image
              src="/error/socket.png"
              width={400}
              height={400}
              alt="Group illustration"
              className="mx-auto"
              priority
            />
          </div>
        </div>
      </body>
    </html>
  );
}
