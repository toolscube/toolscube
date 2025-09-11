"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToolsData } from "@/data/tools";

const categories = ToolsData.map((cat) => ({
  key: cat.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""),
  label: cat.title,
  icon: cat.icon,
  items: cat.items,
}));

export default function ToolsIndexPage() {
  return (
    <main className="py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,hsl(var(--primary)/.15),transparent_60%),radial-gradient(40%_30%_at_80%_0%,hsl(var(--muted-foreground)/.12),transparent_60%),radial-gradient(30%_30%_at_50%_80%,hsl(var(--primary)/.12),transparent_60%)]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_30%,#000_40%,transparent_70%)]">
          <div className="h-full w-full bg-[linear-gradient(to_right,transparent_0,transparent_49%,hsl(var(--border))_50%,transparent_51%),linear-gradient(to_bottom,transparent_0,transparent_49%,hsl(var(--border))_50%,transparent_51%)] bg-[length:32px_32px] motion-safe:animate-[slow-pan_30s_linear_infinite]" />
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-background/60 p-6 md:p-10 mb-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            Explore tools
          </Badge>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            All Tools
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Utilities for links, text, PDF, images, development, SEO, and quick calculations.
          </p>
          <div className="flex gap-3 pt-1">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">About</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link key={c.key} href={`#cat-${c.key}`} className="group focus:outline-none">
            <Card className="relative h-full overflow-hidden rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(2,132,199,0.08)] focus-within:ring-2 focus-within:ring-primary/40">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
              />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {c.icon && <c.icon className="h-4 w-4 text-muted-foreground" />}
                  {c.label}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {c.items.length} tools
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="transition-transform group-hover:-translate-y-0.5"
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <Separator className="my-8" />

      {/* Grouped lists */}
      <section className="space-y-10">
        {categories.map((c) => (
          <div key={c.key} id={`cat-${c.key}`}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {c.icon && <c.icon className="h-5 w-5 text-muted-foreground" />}
                {c.label}
              </h2>
              <Badge variant="secondary">{c.items.length}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {c.items.map((t) => (
                <Link
                  key={t.url}
                  href={t.url}
                  className="group focus:outline-none"
                  aria-label={t.title}
                >
                  <Card className="relative h-full overflow-hidden rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 transition-all hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(2,132,199,0.08)] focus-within:ring-2 focus-within:ring-primary/40">
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
                    />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="transition-transform group-hover:-translate-y-0.5"
                      >
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Separator className="my-8" />

      {/* Footer CTA */}
      <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>Didn’t find a tool? Request a new one.</div>
        <Button asChild variant="outline">
          <a href="mailto:tariqul@tariqul.dev">Request a tool</a>
        </Button>
      </footer>
    </main>
  );
}
