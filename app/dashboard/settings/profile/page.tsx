import ProfileForm from "@/components/dashboard/profile-form";
import ProfileHeader from "@/components/dashboard/profile-header";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/auth-utils";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile Settings | ToolsCube",
  description: "Manage your profile settings and account information",
};

export default async function ProfileSettingsPage() {
  const sessionUser = await requireAuth();

  // Fetch full user data from database
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <ProfileHeader />

      <Separator className="my-6" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1 p-6 h-fit">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-purple-500/20 blur-xl rounded-full" />
                <div className="relative z-10 w-24 h-24 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold">{user.name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.emailVerified ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-xs font-medium">
                  {user.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Account Type
                </p>
                <p className="text-sm font-medium capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Member Since
                </p>
                <p className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm font-medium">
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Form Card */}
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
