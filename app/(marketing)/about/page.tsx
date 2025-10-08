import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateSEOMetadata } from "@/lib/seo-config";

export const metadata = generateSEOMetadata({
  title: "About Tools Cube",
  description:
    "Learn about Tools Cube — our mission is to provide fast, free, privacy-friendly online utilities for developers and businesses worldwide.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-background/40 p-6 md:p-10">
        {/* gradient aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(60%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]"
        />
        <div className="relative flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Fast • Free • Privacy-Friendly
          </Badge>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            About Tools Cube
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Tools Cube brings essential online utilities together — URL shortener, PDF & image
            tools, text utilities, developer helpers, and calculators — with a focus on speed,
            simplicity, and privacy.
          </p>
          <div className="mt-2 flex gap-3">
            <Button asChild>
              <a href="/tools">Explore Tools</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/(marketing)/privacy">Privacy Policy</a>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Values + Tech */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
          />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">What we value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Speed & usability first</p>
            <p>• Minimal data collection</p>
            <p>• Free & accessible tooling</p>
            <p>• Thoughtful ads, never blocking actions</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
          />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tech we use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Next.js (App Router), TypeScript</p>
            <p>• ShadCN UI, TailwindCSS</p>
            <p>• Prisma + PostgreSQL (shortener & analytics)</p>
            <p>• ISR caching, privacy-minded telemetry</p>
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tools available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">25+</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Average load time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">&lt; 1s</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Data collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Minimal</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cost to use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Free</div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      {/* Journey */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Our journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              We started Tools Cube to remove small daily frictions: converting files, cleaning
              text, generating links, and validating data — quickly, without sign-ups or bloated
              apps.
            </p>
            <p>
              Today, we’re expanding responsibly: better performance, clearer privacy choices, and a
              growing catalog of practical utilities that respect your time and attention.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
          />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Get in touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Have feedback or a tool request? We’d love to hear it.</p>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/tools">Explore tools</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:contact@toolscube.app">Contact</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
