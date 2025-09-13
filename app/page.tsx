import {
  ArrowRight,
  Fingerprint,
  Github,
  Lock,
  type LucideIcon,
  MonitorSmartphone,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { GridPattern } from "@/components/magicui/grid-pattern";
import Footer from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { ToolsData } from "@/data/tools";
import { cn } from "@/lib/utils";

type ToolItem = {
  title: string;
  url: string;
  description?: string;
  popular?: boolean;
};

type ToolCategory = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items: ToolItem[];
};

const isRootTools = (c: ToolCategory) => c.title.toLowerCase() === "tools";

function getPopularTools(max = 12): ToolItem[] {
  const flat: ToolItem[] = (ToolsData as ToolCategory[]).flatMap((cat) => cat.items ?? []);
  const popular = flat.filter((t) => t.popular);
  const pool = popular.length ? popular : flat;
  const seen = new Set<string>();
  const unique = pool.filter((t) => {
    if (seen.has(t.url)) return false;
    seen.add(t.url);
    return true;
  });
  return unique.slice(0, max);
}

function getActiveCategories(): ToolCategory[] {
  return (ToolsData as ToolCategory[]).filter((c) => c.isActive && !isRootTools(c));
}

export default function HomePage() {
  const trending = useMemo(() => getPopularTools(8), []);

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center text-center space-y-6 my-24">
        <GridPattern />
        <div className="z-10 flex items-center justify-center">
          <div
            className={cn(
              "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
            )}
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <span>✨ Fast • Free • Privacy‑Friendly</span>
            </AnimatedShinyText>
          </div>
        </div>
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Build faster with everyday developer & business tools.
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Shorten links, convert files, format JSON, calculate values — crafted with ShadCN, tuned
          for speed.
        </p>

        <div className="flex flex-wrap gap-3 z-10">
          <Button asChild size="lg">
            <Link href="/tools" aria-label="Explore all tools">
              Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/about" aria-label="Learn more about Tools Hub">
              About
            </Link>
          </Button>
        </div>
      </section>

      {/* Three-up feature row */}
      <section className="mx-auto max-w-7xl px-2 pt-30">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<Rocket className="h-5 w-5" />} title="Blazing fast">
            Instant load, lightweight pages and cache‑friendly.
          </FeatureCard>
          <FeatureCard icon={<Lock className="h-5 w-5" />} title="Private by default">
            Browser‑first tools; server features avoid persistent storage.
          </FeatureCard>
          <FeatureCard
            icon={<MonitorSmartphone className="h-5 w-5" />}
            title="Responsive & accessible"
          >
            Keyboard friendly, WCAG‑aware, mobile‑ready.
          </FeatureCard>
        </div>
      </section>

      {/* Categories grid */}
      <section className="mx-auto max-w-7xl px-2 pt-12">
        <SectionHeader title="Browse by category" href="/tools" cta="View all" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {getActiveCategories().map((c) => (
            <Link key={c.url} href={c.url} className="group focus:outline-none">
              <GlassCard className="h-full border-none">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded-xl border bg-background p-2">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight">
                      {c.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {c.items?.length ?? 0} tool{(c.items?.length ?? 0) === 1 ? "" : "s"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {(c.items || []).slice(0, 3).map((t) => (
                      <Badge key={t.url} variant="secondary" className="text-xs">
                        {t.title}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular & Recent side-by-side */}
      <section className="mx-auto max-w-7xl px-2 pt-12">
        <div>
          <SectionHeader title="Popular tools" href="/tools" cta="Explore all" />
          <ToolsGrid tools={trending} />
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="mx-auto max-w-7xl px-2 pt-12">
        <GlassCard className="overflow-hidden">
          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                <h3 className="text-lg font-semibold tracking-tight">Security & Privacy</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We prioritize on‑device processing. For server features, we don’t persist your data.
              </p>
            </div>
            <div className="self-center justify-self-end">
              <Button asChild variant="outline">
                <Link href="/privacy">Read our privacy policy</Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-2 pt-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">FAQs</h2>
        <Accordion type="single" collapsible className="rounded-2xl border p-2">
          <AccordionItem value="a1">
            <AccordionTrigger>Is Tools Hub free?</AccordionTrigger>
            <AccordionContent>Yes. Most tools are free to use without an account.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="a2">
            <AccordionTrigger>Do you store my data?</AccordionTrigger>
            <AccordionContent>
              No. Tools run in your browser where possible. Server features avoid persistent
              storage.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a3">
            <AccordionTrigger>How can I request a tool?</AccordionTrigger>
            <AccordionContent>Use the Contact page or open an issue on GitHub.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Sponsor / Contribute */}
      <section className="mx-auto max-w-7xl px-2 py-12">
        <Card className="overflow-hidden border bg-background">
          <div className="relative grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-10">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <h3 className="text-2xl font-semibold tracking-tight">Support the project</h3>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                Sponsor to help us ship faster and keep Tools Hub free for everyone.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3 md:justify-end">
              <Button asChild>
                <Link href="/sponsor">Become a sponsor</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href="https://github.com/tariqul420/tools-hub"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" /> GitHub
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Separator className="mx-auto my-8 max-w-7xl" />

      <Footer />
    </main>
  );
}

function SectionHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <Button variant="ghost" asChild>
        <Link href={href} className="inline-flex items-center">
          {cta} <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="h-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="rounded-xl border bg-background p-2">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">{children}</CardContent>
    </GlassCard>
  );
}

function ToolsGrid({ tools }: { tools: ToolItem[] }) {
  return (
    <div className="grid gap-5 pt-1 sm:grid-cols-2 lg:grid-cols-4">
      {tools.map((t) => (
        <Link
          key={t.url}
          href={t.url}
          className="group focus:outline-none"
          aria-label={`${t.title}${t.description ? ` — ${t.description}` : ""}`}
        >
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold tracking-tight">{t.title}</CardTitle>
              {t.description && (
                <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                  {t.description}
                </CardDescription>
              )}
            </CardHeader>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}
