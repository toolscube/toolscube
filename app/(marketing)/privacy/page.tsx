import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSEOMetadata } from "@/lib/seo-config";

export const metadata = generateSEOMetadata({
  title: "Privacy Policy",
  description:
    "Our commitment to privacy and data handling practices at Tools Cube. Learn how we protect your data and maintain privacy-first principles.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-lg text-muted-foreground">
          Tools Cube is privacy-first by design. Most tools run entirely in your
          browser.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>What We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Most tools run entirely in your browser - no data sent to
              servers
            </p>
            <p>• URL shortener stores links and anonymous click statistics</p>
            <p>• Optional authentication for saved preferences (email only)</p>
            <p>• No tracking cookies or third-party analytics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• URL shortener: redirect users and prevent abuse</p>
            <p>• Authentication: secure account access</p>
            <p>
              • Server logs: security and debugging (auto-deleted after 30 days)
            </p>
            <p>• We never sell or share your data with third parties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use all tools without an account</p>
            <p>• Request data deletion anytime</p>
            <p>• Export your data (for authenticated features)</p>
            <p>• Contact us: contact@toolscube.app</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• HTTPS encryption for all connections</p>
            <p>• Secure password hashing (bcrypt)</p>
            <p>• Regular security updates</p>
            <p>• Open source - audit our code on GitHub</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
