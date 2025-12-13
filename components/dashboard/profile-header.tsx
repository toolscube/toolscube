"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfileHeader() {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Profile Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and personal information
          </p>
        </div>
      </div>
    </div>
  );
}
