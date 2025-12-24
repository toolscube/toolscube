import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSEOMetadata } from "@/lib/seo-config";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "About Tools Cube - Free Open Source Online Tools",
  description:
    "Learn about Tools Cube — 70+ free online tools for developers and professionals. Open source, privacy-first, no signup required. Built with Next.js, TypeScript, and modern web technologies.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          About Tools Cube
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Free, open source online tools for everyone. Fast, privacy-friendly,
          and always free.
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            We built Tools Cube to provide essential online utilities without
            the friction of sign-ups, paywalls, or privacy concerns. Every tool
            works instantly in your browser, with no data collection or
            tracking.
          </p>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Source</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            MIT licensed and publicly available on GitHub. Contributions
            welcome.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Privacy First</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All tools run client-side. No tracking, no analytics, no data
            collection.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Always Free</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No premium tiers or hidden costs. Tools Cube will always be free.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fast & Simple</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Lightweight, responsive design. Works on any device, no installation
            required.
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Built With</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Next.js 15, TypeScript, Shadcn/ui, Tailwind CSS, Prisma, PostgreSQL
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" asChild>
          <Link href="/tools">Explore All Tools</Link>
        </Button>
      </div>
    </div>
  );
}
