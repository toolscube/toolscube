'use client';

import SectionHeader from '@/components/root/section-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BarChart2, Check, Copy, ExternalLink, Link as LinkIcon, QrCode, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';

// ---- Local types & helpers ----

type ShortItem = {
  slug: string;
  url: string;
  createdAt: number;
  clicks?: number;
};

const STORE_KEY = 'tools:url:shorts:v1';

function loadShorts(): ShortItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as ShortItem[]) : [];
  } catch {
    return [];
  }
}

function saveShorts(items: ShortItem[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  } catch {}
}

function slugifyCustom(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function randomSlug(n = 6) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function isValidHttpUrl(u: string) {
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function UrlShortenerPage() {
  const [dest, setDest] = useState('');
  const [custom, setCustom] = useState('');
  const [copied, setCopied] = useState(false);
  const [items, setItems] = useState<ShortItem[]>([]);

  useEffect(() => {
    setItems(loadShorts());
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const short = useMemo(() => {
    const slug = custom ? slugifyCustom(custom) : '';
    return slug ? `${origin}/tools/url/interstitial/${slug}` : '';
  }, [origin, custom]);

  const create = () => {
    // validate
    if (!isValidHttpUrl(dest)) {
      alert('Please enter a valid URL including http:// or https://');
      return;
    }
    // slug
    let slug = custom ? slugifyCustom(custom) : randomSlug();
    if (!slug) slug = randomSlug();

    // ensure unique in local store
    let list = loadShorts();
    if (list.some((i) => i.slug === slug)) {
      // if custom collides, extend with random tail
      if (custom) slug = `${slug}-${randomSlug(3)}`;
      else slug = randomSlug();
    }

    const item: ShortItem = { slug, url: dest.trim(), createdAt: Date.now(), clicks: 0 };
    list = [item, ...list].slice(0, 50);
    setItems(list);
    saveShorts(list);
    setCustom(slug);
  };

  const shortUrl = custom ? `${origin}/tools/url/interstitial/${slugifyCustom(custom)}` : '';
  const analyticsUrl = custom ? `${origin}/tools/url/analytics/${slugifyCustom(custom)}` : '';

  const copyShort = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {}
  };

  const reset = () => {
    setDest('');
    setCustom('');
    setCopied(false);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <SectionHeader title="URL Shortener" desc="Create short, trackable links with a beautiful glass UI. (Local demo — interstitial & analytics pages use localStorage.)" />

      <MotionGlassCard className="p-6">
        {/* Input row */}
        <div className="grid gap-4 sm:grid-cols-[1fr]">
          <div className="grid gap-2">
            <Label>Destination URL</Label>
            <div className="flex gap-2">
              <Input placeholder="https://example.com/very/long/path?utm_source=tools" value={dest} onChange={(e) => setDest(e.target.value)} className="bg-background/60 backdrop-blur" />
              <Button variant="outline" onClick={() => setDest('')}>
                Clear
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Custom alias (optional)</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border bg-background/60 p-2 text-sm backdrop-blur">
                <span className="text-muted-foreground">{origin}/tools/url/interstitial/</span>
                <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="my-link" className="inline-flex h-7 w-[12rem] border-0 bg-transparent p-0 focus-visible:ring-0" />
              </div>
              <Button onClick={create}>
                <LinkIcon className="mr-2 h-4 w-4" /> Shorten
              </Button>
              <Button variant="outline" onClick={reset}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Allowed: letters, numbers, dash/underscore. Example: <code>summer-sale-2025</code>
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Result */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <GlassCard className="p-4">
            <div className="text-sm text-muted-foreground">Your short link</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-muted px-2 py-1 text-sm">{shortUrl || '—'}</code>
              <Button variant="ghost" size="sm" onClick={copyShort} disabled={!shortUrl} className="flex items-center gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
              </Button>
              {shortUrl && (
                <Link href={shortUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" /> Open
                  </Button>
                </Link>
              )}
              {analyticsUrl && (
                <Link href={analyticsUrl}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <BarChart2 className="h-4 w-4" /> Analytics
                  </Button>
                </Link>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Note: For a full production shortener, connect a database and redirect API. This demo stores data locally.</p>
          </GlassCard>

          {/* QR */}
          <GlassCard className="flex items-center justify-center p-4">
            {shortUrl ? (
              <div className="flex flex-col items-center gap-2">
                <QRCode value={shortUrl} size={128} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
                <Badge variant="secondary" className="gap-1">
                  <QrCode className="h-3.5 w-3.5" /> QR
                </Badge>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">QR appears after you create a link.</div>
            )}
          </GlassCard>
        </div>

        <Separator className="my-6" />

        {/* Recent links */}
        <div className="grid gap-3">
          <div className="text-sm font-medium">Recent</div>
          {items.length === 0 && <div className="text-xs text-muted-foreground">No links yet. Create your first short link above.</div>}
          <div className="grid gap-2">
            {items.slice(0, 6).map((it) => {
              const sUrl = `${origin}/tools/url/interstitial/${it.slug}`;
              const aUrl = `${origin}/tools/url/analytics/${it.slug}`;
              return (
                <GlassCard key={it.slug} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{sUrl}</div>
                    <div className="truncate text-xs text-muted-foreground">→ {it.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={sUrl} target="_blank">
                      <Button size="sm" variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </Link>
                    <Link href={aUrl}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </MotionGlassCard>
    </div>
  );
}
