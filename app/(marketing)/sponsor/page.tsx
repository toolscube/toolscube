import { Button } from "@/components/ui/button";
import { generateSEOMetadata } from "@/lib/seo-config";
import {
  ArrowRight,
  HeartHandshake,
  Rocket,
  Shield,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Sponsor Tools Cube - Support Open Source",
  description:
    "Support Tools Cube open source development and help us keep our tools free for everyone. Sponsor via GitHub Sponsors or direct contribution. Join our community of supporters.",
  path: "/sponsor",
});

const supportWays = [
  {
    title: "Star on GitHub",
    icon: Star,
    href: "https://github.com/toolscube/tools-cube",
  },
  {
    title: "Sponsor Development",
    icon: HeartHandshake,
    href: "https://github.com/sponsors/toolscube",
  },
  {
    title: "Contribute Code",
    icon: Rocket,
    href: "https://github.com/toolscube/tools-cube/blob/main/CONTRIBUTING.md",
  },
] as const;

export default function SponsorPage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm font-medium">
            <Star className="h-4 w-4 fill-primary text-primary" />
            Open Source & Free Forever
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Support Tools Cube
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Tools Cube is free and open source. Help us maintain and improve the
            platform for millions of users worldwide.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 gap-2 px-8" asChild>
              <Link
                href="https://github.com/sponsors/toolscube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HeartHandshake className="h-5 w-5" />
                Sponsor on GitHub
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 px-8"
              asChild
            >
              <Link
                href="https://github.com/toolscube/tools-cube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="h-5 w-5" />
                Star on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Support Ways */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {supportWays.map((way) => {
            const Icon = way.icon;
            return (
              <Link
                key={way.title}
                href={way.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="flex h-full flex-col items-center rounded-xl border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{way.title}</h3>
                  <ArrowRight className="mt-4 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Support */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          How We Use Your Support
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <Rocket className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">Development</h3>
            <p className="text-sm text-muted-foreground">
              Building new features and improving existing tools
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Shield className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">Infrastructure</h3>
            <p className="text-sm text-muted-foreground">
              Hosting, domains, and keeping the platform fast
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Users className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">Community</h3>
            <p className="text-sm text-muted-foreground">
              Documentation, support, and growing the project
            </p>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Our Sponsors
        </h2>
        <div className="rounded-xl border bg-card p-12 text-center">
          <HeartHandshake className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Your name could be here.{" "}
            <Link
              href="https://github.com/sponsors/toolscube"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Become a sponsor →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="rounded-2xl border bg-primary/5 p-12 text-center">
          <h2 className="text-2xl font-semibold">Ready to Help?</h2>
          <p className="mt-2 text-muted-foreground">
            Every contribution helps keep Tools Cube free for everyone
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link
                href="https://github.com/sponsors/toolscube"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sponsor Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                href="https://github.com/toolscube/tools-cube"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
