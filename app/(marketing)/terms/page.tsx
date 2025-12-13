import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSEOMetadata } from "@/lib/seo-config";

export const metadata = generateSEOMetadata({
  title: "Terms of Service",
  description:
    "Terms and acceptable use for Tools Cube. Read our terms of service and acceptable use policy for our online tools platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Terms of Service
        </h1>
        <p className="text-lg text-muted-foreground">
          By using Tools Cube, you agree to these terms.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use tools for lawful purposes only</p>
            <p>• No spam, phishing, malware, or illegal content</p>
            <p>• Respect rate limits and don&apos;t abuse the service</p>
            <p>• We reserve the right to block abusive usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Tools provided &quot;as is&quot; without warranties</p>
            <p>• We may modify or discontinue features</p>
            <p>• Not liable for data loss or service interruptions</p>
            <p>• Always keep backups of important files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Tools Cube is MIT licensed</p>
            <p>• You can fork, modify, and distribute the code</p>
            <p>• See LICENSE file for full terms</p>
            <p>• GitHub: github.com/toolscube/tools-cube</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Questions about these terms? Email us at{" "}
              <a className="underline" href="mailto:contact@toolscube.app">
                contact@toolscube.app
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
