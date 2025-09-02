'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ToolsData } from '@/data/tools';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

// helpers
type ToolItem = {
  title: string;
  url: string;
  description?: string;
  popular?: boolean;
};

function getPopularTools(max = 12): ToolItem[] {
  const flat: ToolItem[] = ToolsData.flatMap((cat) => cat.items ?? []);
  const popular = flat.filter((t) => t.popular);
  const pool = popular.length ? popular : flat;
  const seen = new Set<string>();
  const unique = pool.filter((t) => (seen.has(t.url) ? false : (seen.add(t.url), true)));
  return unique.slice(0, max);
}

export default function HomePage() {
  const tools = getPopularTools(12);

  return (
    <main className="py-10">
      {/* Hero */}
      <section className="relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border bg-background/60 p-6 md:p-10">
        {/* gradient aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-3xl bg-[radial-gradient(60%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]"
        />
        <Badge variant="secondary" className="relative flex items-center gap-1 text-xs">
          <Sparkles className="h-3.5 w-3.5" /> Fast • Free • Privacy-Friendly
        </Badge>
        <h1 className="relative max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl">Essential online tools, crafted with care.</h1>
        <p className="relative max-w-2xl text-pretty text-muted-foreground">Shorten links, convert PDFs & images, format JSON, calculate BMI, and more — all in one fast and minimal hub.</p>
        <div className="relative flex gap-3">
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

      {/* Tools Grid (Popular) */}
      <section aria-label="Popular tools" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-8">
        {tools.map((t) => (
          <Link key={t.url} href={t.url} className="group focus:outline-none" aria-label={`${t.title}${t.description ? ` — ${t.description}` : ''}`}>
            <Card
              className={[
                'relative h-full overflow-hidden rounded-2xl border',
                'bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50',
                'transition-all duration-300',
                'hover:shadow-[0_20px_50px_-15px_var(--shadow-color,rgba(2,132,199,0.25))] hover:-translate-y-0.5',
                '[--shadow-color:theme(colors.primary/30)]',
                'focus-within:ring-2 focus-within:ring-primary/50',
              ].join(' ')}>
              {/* glow aura */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 right-10 h-24 w-24 rounded-full bg-primary/15 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold tracking-tight">{t.title}</CardTitle>
                {t.description && <CardDescription className="text-sm text-muted-foreground line-clamp-2">{t.description}</CardDescription>}
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="secondary" className="transition-all group-hover:-translate-y-0.5 group-hover:shadow-sm">
                  Open <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>

              {/* sheen bottom gradient */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 translate-y-6 bg-gradient-to-t from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </Card>
          </Link>
        ))}
      </section>

      <Separator className="my-8" />

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} Tools Hub</div>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/sponsor" className="hover:underline">
            Sponsor
          </Link>
        </nav>
      </footer>
    </main>
  );
}
