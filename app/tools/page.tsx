import JsonLd from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { ToolsData } from "@/data/tools";
import { siteURL } from "@/lib/constants";
import {
  buildDynamicKeywords,
  mergeKeywords,
  siteDescriptionFallback,
} from "@/lib/seo-tools";
import type { Metadata } from "next";
import Link from "next/link";

const STATIC_KEYWORDS = [
  "online tools",
  "url shortener",
  "free online tools",
  "developer tools",
  "pdf tools",
  "image tools",
  "image converter",
  "text utilities",
  "json formatter",
  "qr code generator",
  "base64 encoder",
  "hash generator",
  "password generator",
  "seo tools",
  "calculators",
  "unit converter",
  "bmi calculator",
  "currency converter",
  "regex tester",
  "free tools",
  "privacy friendly",
  "no signup required",
  "web utilities",
];

const DYNAMIC_KEYWORDS = buildDynamicKeywords(ToolsData);
const KEYWORDS = mergeKeywords(STATIC_KEYWORDS, DYNAMIC_KEYWORDS);

const description =
  "Browse 70+ free online tools for developers and professionals. URL shortener with QR codes, JSON formatter, image converter, Base64 encoder, hash generator, calculators, SEO tools, and more. No signup required, privacy-first.";
const smartDescription = description || siteDescriptionFallback(ToolsData);

export const metadata: Metadata = {
  title: "Tools",
  description: smartDescription,
  keywords: KEYWORDS,
  openGraph: {
    title: "Tools — Tools Cube",
    description: smartDescription,
    url: `${siteURL}/tools`,
    type: "website",
    siteName: "Tools Cube",
    images: [
      {
        url: `${siteURL}/assets/tools-cube.jpg`,
        width: 1200,
        height: 630,
        alt: "Tools Cube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@toolscube",
    creator: "@toolscube",
    title: "Tools — Tools Cube",
    description: smartDescription,
    images: [`${siteURL}/assets/tools-cube.jpg`],
  },
  alternates: {
    canonical: `${siteURL}/tools`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const categories = ToolsData.filter((cat) => cat.title !== "Tools").map(
  (cat) => ({
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
  })
);

export default function ToolsIndexPage() {
  const navLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tools Cube Categories",
    itemListElement: ToolsData.map((c, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${siteURL}${c.url}`,
    })),
  };

  return (
    <main className="scroll-smooth">
      <JsonLd data={navLd} />

      {/* Hero */}
      <header className="space-y-2 mb-6">
        <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
          All Tools
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Utilities for links, text, PDF, images, development, SEO, and quick
          calculations.
        </p>
      </header>

      {/* Category tiles */}
      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.key}
            href={`#cat-${c.key}`}
            className="group focus:outline-none"
          >
            <GlassCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {c.icon && (
                    <c.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                  {c.label}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {c.items.length} tools
                </CardDescription>
              </CardHeader>
            </GlassCard>
          </Link>
        ))}
      </section>

      <Separator className="mt-8" />

      {/* Grouped lists */}
      <section>
        {categories.map((c) => (
          <div key={c.key} id={`cat-${c.key}`} className="py-4 first:pt-8">
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
                  <GlassCard className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t.description}
                      </CardDescription>
                    </CardHeader>
                  </GlassCard>
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
          <a href="mailto:contact@toolscube.app">Request a tool</a>
        </Button>
      </footer>
    </main>
  );
}
