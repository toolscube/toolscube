'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const tools = [
  { title: 'URL Shortener', desc: 'Custom slug & click analytics', href: '/tools/url' },
  { title: 'QR Code', desc: 'Generate and download QR codes', href: '/tools/text/qr' },
  { title: 'Base64', desc: 'Encode / Decode strings & files', href: '/tools/text/base64' },
  { title: 'Word Counter', desc: 'Count words, chars, lines', href: '/tools/text/word-counter' },
  { title: 'PDF Merge', desc: 'Combine multiple PDFs', href: '/tools/pdf/merge' },
  { title: 'PDF Compress', desc: 'Reduce PDF file size', href: '/tools/pdf/compress' },
  { title: 'Image Convert', desc: 'JPG ⇄ PNG ⇄ WebP', href: '/tools/image/convert' },
  { title: 'Image Resize', desc: 'Resize or crop images', href: '/tools/image/resize' },
  { title: 'JSON Formatter', desc: 'Pretty print & validate JSON', href: '/tools/dev/json-formatter' },
  { title: 'JWT Decoder', desc: 'Decode tokens (offline)', href: '/tools/dev/jwt-decode' },
  { title: 'Unit Converter', desc: 'Length, weight, temperature', href: '/tools/calc/unit-converter' },
  { title: 'BMI Calculator', desc: 'Body Mass Index calculator', href: '/tools/calc/bmi' },
];

export default function HomePage() {
  return (
    <main className="py-10">
      {/* Hero */}
      <section className="relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border bg-background/40 p-6 md:p-8">
        {/* subtle gradient aura for dark */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(60%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]"
        />
        <Badge variant="secondary" className="relative">
          Fast • Free • Privacy-Friendly
        </Badge>
        <h1 className="relative text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">All your essential online tools, in one clean place.</h1>
        <p className="relative max-w-2xl text-pretty text-muted-foreground">
          Shorten links, convert PDFs & images, format JSON, calculate BMI, and more. Built with modern web tech and a focus on speed and usability.
        </p>
        <div className="relative flex gap-3">
          <Button asChild>
            <Link href="/tools" className="text-white" aria-label="Explore all tools">
              Explore Tools
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about" aria-label="Learn more about Tools Hub">
              About
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Tools Grid */}
      <section aria-label="Popular tools" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.title} href={t.href} className="group" aria-label={`${t.title} — ${t.desc}`}>
            <Card
              className={[
                // glassy + gradient top border
                'relative h-full overflow-hidden rounded-2xl border',
                'bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40',
                // hover and focus states
                'transition-all duration-200',
                'hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(2,132,199,0.08)]',
                'focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/50',
              ].join(' ')}>
              {/* gradient top hairline */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">{t.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{t.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="secondary" className="transition-transform group-hover:-translate-y-0.5">
                  Open
                </Button>
              </CardContent>

              {/* subtle bottom sheen on hover (dark nice) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 translate-y-6 bg-gradient-to-t from-primary/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </Card>
          </Link>
        ))}
      </section>

      <Separator className="my-12" />

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} Tools Hub</div>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </nav>
      </footer>
    </main>
  );
}
