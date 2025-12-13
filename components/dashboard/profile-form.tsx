"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Loader2,
  Mail,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import InputField from "@/components/shared/form-fields/input-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import Link from "next/link";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/update-user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/auth/delete-user", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Update your personal details and how others see you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <InputField
                  name="name"
                  icon={User}
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                />

                <InputField
                  name="email"
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This is your primary email address for sign in and
                  notifications
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Change your password to keep your account secure
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/forgot-password">Change Password</Link>
            </Button>
          </div>

          {!user.emailVerified && (
            <div className="flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-yellow-900">
                  Email verification pending
                </p>
                <p className="text-sm text-yellow-800">
                  Please verify your email address to unlock all features
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/verify-email">Verify Email</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers
                    including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile information</li>
                      <li>All your short links</li>
                      <li>Click analytics data</li>
                      <li>Account preferences</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
