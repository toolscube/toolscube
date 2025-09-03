import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Privacy Policy — Tools Hub",
  description: "Our commitment to privacy and data handling practices.",
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toISOString().slice(0, 10);

  return (
    <main className="py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-background/40 p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(60%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]"
        />
        <div className="relative flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Privacy-first by design
          </Badge>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            We design Tools Hub to be privacy-friendly. This page explains what we collect, how we
            use it, and the choices you have.
          </p>
          <div className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Data we process */}
      <Card className="relative mb-4 overflow-hidden bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
        />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data we may process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Basic, anonymous usage metrics to improve reliability and performance.</p>
          <p>
            • For URL shortener: salted/hashed IP and user-agent fingerprints for anti-abuse
            analytics.
          </p>
          <p>
            • We do <span className="font-medium text-foreground">not</span> sell personal data.
          </p>
          <p>
            • No tracking cookies for using tools. Some optional features may require account login.
          </p>
        </CardContent>
      </Card>

      {/* Cookies & Ads */}
      <Card className="relative mb-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
        />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cookies & advertising</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Core tools run without tracking cookies.</p>
          <p>• If ad networks are enabled, they may set their own cookies per their policies.</p>
          <p>• We aim for thoughtful ad placement that never blocks primary actions.</p>
        </CardContent>
      </Card>

      {/* Third-party services */}
      <Card className="relative mb-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
        />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Third-party services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • Privacy-respecting analytics and error monitoring (aggregate, non-identifying where
            possible).
          </p>
          <p>• Optional storage/CDN providers for media processing (e.g., Cloudinary/S3).</p>
          <p>• Authentication (if enabled) via a trusted identity provider.</p>
        </CardContent>
      </Card>

      {/* Retention & security */}
      <Card className="relative mb-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
        />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data retention & security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• We keep data only as long as necessary for the feature or to comply with law.</p>
          <p>• We use encryption in transit (HTTPS) and restrict access by role.</p>
          <p>• Abuse/fraud logs may be retained longer to protect the service.</p>
        </CardContent>
      </Card>

      {/* Your choices */}
      <Card className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
        />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your choices & contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• You may use tools without an account; optional features can be skipped.</p>
          <p>• You can request removal of any account-bound data you control.</p>
          <p>
            • Contact us for privacy requests:{" "}
            <a className="underline" href="mailto:support@your-domain.com">
              support@your-domain.com
            </a>
          </p>
          <div className="pt-2">
            <Button asChild>
              <a href="/about">Learn more about Tools Hub</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
