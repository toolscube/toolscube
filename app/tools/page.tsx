'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type Tool = { title: string; desc: string; href: string; category: string };

const ALL_TOOLS: Tool[] = [
  // URL
  { title: 'URL Shortener', desc: 'Custom slug & click analytics', href: '/tools/url', category: 'URL' },

  // TEXT
  { title: 'QR Code', desc: 'Generate and download QR codes', href: '/tools/text/qr', category: 'Text' },
  { title: 'Base64', desc: 'Encode/Decode strings & files', href: '/tools/text/base64', category: 'Text' },
  { title: 'Case Converter', desc: 'Upper/Lower/Title/Sentence', href: '/tools/text/case-converter', category: 'Text' },
  { title: 'Slugify', desc: 'URL-safe slugs from any text', href: '/tools/text/slugify', category: 'Text' },
  { title: 'Word Counter', desc: 'Count words, chars, lines', href: '/tools/text/word-counter', category: 'Text' },

  // PDF
  { title: 'PDF Merge', desc: 'Combine multiple PDFs', href: '/tools/pdf/merge', category: 'PDF' },
  { title: 'PDF Split', desc: 'Split a PDF into pages', href: '/tools/pdf/split', category: 'PDF' },
  { title: 'PDF Compress', desc: 'Reduce PDF file size', href: '/tools/pdf/compress', category: 'PDF' },
  { title: 'PDF to Word', desc: 'Convert PDF → DOCX', href: '/tools/pdf/pdf-to-word', category: 'PDF' },

  // IMAGE
  { title: 'Image Convert', desc: 'JPG ⇄ PNG ⇄ WebP ⇄ AVIF', href: '/tools/image/convert', category: 'Image' },
  { title: 'Image Resize', desc: 'Resize or crop images', href: '/tools/image/resize', category: 'Image' },
  { title: 'EXIF Remove', desc: 'Strip metadata from images', href: '/tools/image/exif-remove', category: 'Image' },

  // DEV
  { title: 'JSON Formatter', desc: 'Pretty print & validate JSON', href: '/tools/dev/json-formatter', category: 'Dev' },
  { title: 'JWT Decoder', desc: 'Decode tokens (offline)', href: '/tools/dev/jwt-decode', category: 'Dev' },
  { title: 'Regex Tester', desc: 'Test regular expressions', href: '/tools/dev/regex-tester', category: 'Dev' },

  // SEO
  { title: 'OG Image Builder', desc: 'OpenGraph image templates', href: '/tools/seo/og-builder', category: 'SEO' },
  { title: 'robots.txt Generator', desc: 'Generate robots.txt', href: '/tools/seo/robots-generator', category: 'SEO' },

  // CALC
  { title: 'BMI Calculator', desc: 'Body Mass Index', href: '/tools/calc/bmi', category: 'Calc' },
  { title: 'Unit Converter', desc: 'Length, weight, temperature', href: '/tools/calc/unit-converter', category: 'Calc' },
  { title: 'Date Difference', desc: 'Days between two dates', href: '/tools/calc/date-diff', category: 'Calc' },
];

const CATEGORIES = [
  { key: 'URL', label: 'URL' },
  { key: 'Text', label: 'Text' },
  { key: 'PDF', label: 'PDF' },
  { key: 'Image', label: 'Image' },
  { key: 'Dev', label: 'Developer' },
  { key: 'SEO', label: 'SEO' },
  { key: 'Calc', label: 'Calculators' },
];

export default function ToolsIndexPage() {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q.trim()) return ALL_TOOLS;
    const s = q.toLowerCase();
    return ALL_TOOLS.filter((t) => t.title.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
  }, [q]);

  // group by category preserving order in CATEGORIES
  const grouped = useMemo(() => {
    const map: Record<string, Tool[]> = {};
    for (const c of CATEGORIES) map[c.key] = [];
    for (const t of filtered) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    }
    return map;
  }, [filtered]);

  return (
    <main className="py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-background/40 p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(60%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]"
        />
        <div className="relative flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            Explore tools
          </Badge>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">All Tools</h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">Find utilities for links, text, PDF, images, development, SEO, and quick calculations.</p>
          <div className="flex w-full max-w-lg items-center gap-3 pt-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools (e.g., pdf, json, slug, bmi)…" aria-label="Search tools" />
            <Button variant="outline" onClick={() => setQ('')} aria-label="Clear search">
              Clear
            </Button>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Category tiles */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const count = grouped[c.key]?.length ?? 0;
          return (
            <Link key={c.key} href={`#cat-${c.key}`} className="group">
              <Card
                className={[
                  'relative h-full overflow-hidden rounded-2xl border',
                  'bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40',
                  'transition-all hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(2,132,199,0.08)]',
                ].join(' ')}>
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.label}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{count} tools</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button size="sm" variant="secondary" className="transition-transform group-hover:-translate-y-0.5">
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <Separator className="my-8" />

      {/* Grouped lists */}
      <section className="space-y-10">
        {CATEGORIES.map((c) => {
          const items = grouped[c.key] || [];
          if (!items.length) return null;
          return (
            <div key={c.key} id={`cat-${c.key}`}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-xl font-semibold">{c.label}</h2>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <Link key={t.href} href={t.href} className="group" aria-label={`${t.title} — ${t.desc}`}>
                    <Card
                      className={[
                        'relative h-full overflow-hidden rounded-2xl border',
                        'bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40',
                        'transition-all hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(2,132,199,0.08)]',
                      ].join(' ')}>
                      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">{t.desc}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button size="sm" variant="secondary" className="transition-transform group-hover:-translate-y-0.5">
                          Open
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Separator className="my-12" />

      {/* Footer CTA */}
      <footer className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-muted-foreground">
        <div>Didn’t find a tool? Request a new one.</div>
        <Button asChild variant="outline">
          <a href="mailto:support@your-domain.com">Request a tool</a>
        </Button>
      </footer>
    </main>
  );
}
