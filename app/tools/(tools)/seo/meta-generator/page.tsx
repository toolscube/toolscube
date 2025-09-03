'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { Check, Copy, Download, ExternalLink, Globe, Image as ImageIcon, Link as LinkIcon, Palette, RotateCcw, Sparkles, Twitter, Type, User } from 'lucide-react';

// ---------------- Types ----------------
type TwitterCard = 'summary' | 'summary_large_image' | 'app' | 'player';
type OgType = 'website' | 'article' | 'product' | 'profile' | 'video.other';

type State = {
  // Basics
  title: string;
  siteName: string;
  description: string;
  author: string;
  canonical: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsNoSnippet: boolean;

  // Brand
  themeColor: string;
  favicon: string;
  icon32: string;
  icon180: string;
  manifest: string;

  // Locale
  lang: string;
  dir: 'ltr' | 'rtl';

  // Open Graph
  useOG: boolean;
  ogType: OgType;
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: string;
  ogImageHeight: string;

  // Twitter
  useTwitter: boolean;
  twitterCard: TwitterCard;
  twitterSite: string;
  twitterCreator: string;
  twitterImage: string;
  twitterImageAlt: string;

  // Advanced
  viewport: string;

  // UI
  pretty: boolean;
};

const DEFAULT: State = {
  title: 'Your Page Title',
  siteName: 'Your Site',
  description: 'Short description for search and social previews.',
  author: 'Your Name',
  canonical: 'https://example.com/page',
  robotsIndex: true,
  robotsFollow: true,
  robotsNoSnippet: false,

  themeColor: '#0ea5e9',
  favicon: '/favicon.ico',
  icon32: '/icons/icon-32x32.png',
  icon180: '/icons/apple-touch-icon.png',
  manifest: '/site.webmanifest',

  lang: 'en',
  dir: 'ltr',

  useOG: true,
  ogType: 'website',
  ogUrl: 'https://example.com/page',
  ogImage: 'https://example.com/og-image.jpg',
  ogImageAlt: 'Open Graph image',
  ogImageWidth: '1200',
  ogImageHeight: '630',

  useTwitter: true,
  twitterCard: 'summary_large_image',
  twitterSite: '@yourbrand',
  twitterCreator: '@yourhandle',
  twitterImage: 'https://example.com/og-image.jpg',
  twitterImageAlt: 'Social image',

  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',

  pretty: true,
};

// ---------------- Helpers ----------------
const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

const isHttpUrl = (s: string) => /^https?:\/\//i.test(s || '');

function robotsValue(s: State) {
  const parts: string[] = [];
  parts.push(s.robotsIndex ? 'index' : 'noindex');
  parts.push(s.robotsFollow ? 'follow' : 'nofollow');
  if (s.robotsNoSnippet) parts.push('nosnippet');
  return parts.join(', ');
}

function genMeta(state: State) {
  const s = state;
  const L: string[] = [];

  L.push(`<!-- html lang="${s.lang}" dir="${s.dir}" -->`);

  // Basic
  if (s.title) L.push(`<title>${esc(s.title)}</title>`);
  if (s.description) L.push(`<meta name="description" content="${esc(s.description)}" />`);
  if (s.author) L.push(`<meta name="author" content="${esc(s.author)}" />`);
  if (s.canonical) L.push(`<link rel="canonical" href="${esc(s.canonical)}" />`);
  L.push(`<meta name="robots" content="${robotsValue(s)}" />`);
  if (s.viewport) L.push(`<meta name="viewport" content="${esc(s.viewport)}" />`);

  // Brand / PWA
  if (s.themeColor) L.push(`<meta name="theme-color" content="${esc(s.themeColor)}" />`);
  if (s.favicon) L.push(`<link rel="icon" href="${esc(s.favicon)}" />`);
  if (s.icon32) L.push(`<link rel="icon" type="image/png" sizes="32x32" href="${esc(s.icon32)}" />`);
  if (s.icon180) L.push(`<link rel="apple-touch-icon" sizes="180x180" href="${esc(s.icon180)}" />`);
  if (s.manifest) L.push(`<link rel="manifest" href="${esc(s.manifest)}" />`);

  // Open Graph
  if (s.useOG) {
    const ogTitle = s.title;
    const ogDesc = s.description;
    const ogSite = s.siteName;
    if (ogTitle) L.push(`<meta property="og:title" content="${esc(ogTitle)}" />`);
    if (ogDesc) L.push(`<meta property="og:description" content="${esc(ogDesc)}" />`);
    L.push(`<meta property="og:type" content="${esc(s.ogType)}" />`);
    if (s.ogUrl) L.push(`<meta property="og:url" content="${esc(s.ogUrl)}" />`);
    if (ogSite) L.push(`<meta property="og:site_name" content="${esc(ogSite)}" />`);
    if (s.ogImage) L.push(`<meta property="og:image" content="${esc(s.ogImage)}" />`);
    if (s.ogImageAlt) L.push(`<meta property="og:image:alt" content="${esc(s.ogImageAlt)}" />`);
    if (s.ogImageWidth) L.push(`<meta property="og:image:width" content="${esc(s.ogImageWidth)}" />`);
    if (s.ogImageHeight) L.push(`<meta property="og:image:height" content="${esc(s.ogImageHeight)}" />`);
    if (s.lang) L.push(`<meta property="og:locale" content="${esc(s.lang.replace('-', '_'))}" />`);
  }

  // Twitter
  if (s.useTwitter) {
    L.push(`<meta name="twitter:card" content="${esc(s.twitterCard)}" />`);
    if (s.twitterSite) L.push(`<meta name="twitter:site" content="${esc(s.twitterSite)}" />`);
    if (s.twitterCreator) L.push(`<meta name="twitter:creator" content="${esc(s.twitterCreator)}" />`);
    if (s.title) L.push(`<meta name="twitter:title" content="${esc(s.title)}" />`);
    if (s.description) L.push(`<meta name="twitter:description" content="${esc(s.description)}" />`);
    const tImg = s.twitterImage || s.ogImage;
    if (tImg) L.push(`<meta name="twitter:image" content="${esc(tImg)}" />`);
    const tAlt = s.twitterImageAlt || s.ogImageAlt;
    if (tAlt) L.push(`<meta name="twitter:image:alt" content="${esc(tAlt)}" />`);
  }

  const out = L.join('\n');
  return s.pretty ? out + '\n' : out;
}

function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function charCount(s: string) {
  return s.trim().length;
}

// ---------------- Page ----------------
export default function MetaGeneratorPage() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('meta-gen-v1');
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  const [copied, setCopied] = React.useState(false);
  const output = React.useMemo(() => genMeta(s), [s]);

  React.useEffect(() => {
    localStorage.setItem('meta-gen-v1', JSON.stringify(s));
  }, [s]);

  function resetAll() {
    setS(DEFAULT);
    setCopied(false);
  }

  async function copyOut() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const titleLen = charCount(s.title);
  const descLen = charCount(s.description);
  const titleOk = titleLen >= 15 && titleLen <= 70;
  const descOk = descLen >= 50 && descLen <= 160;

  const previewImage = s.twitterImage || s.ogImage;

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6" /> Meta Tags Generator
          </h1>
          <p className="text-sm text-muted-foreground">Head meta preview for SEO & social. Build clean tags for Open Graph + Twitter and copy in one click.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={copyOut} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Tags
          </Button>
          <Button onClick={() => downloadTxt('meta-tags.html', output)} className="gap-2">
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </GlassCard>

      {/* Basics */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Title, description, canonical, robots & author.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Type className="h-4 w-4" /> Title
              </Label>
              <Input id="title" value={s.title} onChange={(e) => setS((p) => ({ ...p, title: e.target.value }))} placeholder="Compelling page title" />
              <div className="flex items-center justify-between text-xs">
                <span className={titleOk ? 'text-muted-foreground' : 'text-orange-600'}>{titleOk ? 'Good length' : 'Aim for 15–70 chars'}</span>
                <span className="text-muted-foreground">{titleLen} chars</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={s.description}
                onChange={(e) => setS((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short summary that encourages clicks…"
                className="min-h-[90px]"
              />
              <div className="flex items-center justify-between text-xs">
                <span className={descOk ? 'text-muted-foreground' : 'text-orange-600'}>{descOk ? 'Good length' : 'Aim for 50–160 chars'}</span>
                <span className="text-muted-foreground">{descLen} chars</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="site">Site Name</Label>
                <Input id="site" value={s.siteName} onChange={(e) => setS((p) => ({ ...p, siteName: e.target.value }))} placeholder="Your Site" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Author
                </Label>
                <Input id="author" value={s.author} onChange={(e) => setS((p) => ({ ...p, author: e.target.value }))} placeholder="Your Name / Brand" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="canonical" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Canonical URL
              </Label>
              <Input id="canonical" value={s.canonical} onChange={(e) => setS((p) => ({ ...p, canonical: e.target.value }))} placeholder="https://example.com/page" />
              {!isHttpUrl(s.canonical) && s.canonical.trim() !== '' && <p className="text-xs text-orange-600">Use absolute URL (https://…)</p>}
            </div>

            <div className="rounded-md border p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center justify-between">
                  <Label>Index</Label>
                  <Switch checked={s.robotsIndex} onCheckedChange={(v) => setS((p) => ({ ...p, robotsIndex: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Follow</Label>
                  <Switch checked={s.robotsFollow} onCheckedChange={(v) => setS((p) => ({ ...p, robotsFollow: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>No Snippet</Label>
                  <Switch checked={s.robotsNoSnippet} onCheckedChange={(v) => setS((p) => ({ ...p, robotsNoSnippet: v }))} />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Robots: {robotsValue(s)}</p>
            </div>
          </div>

          {/* Brand / Locale */}
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" /> Brand & PWA
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="theme">Theme Color</Label>
                  <Input id="theme" type="color" value={s.themeColor} onChange={(e) => setS((p) => ({ ...p, themeColor: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manifest">Manifest</Label>
                  <Input id="manifest" value={s.manifest} onChange={(e) => setS((p) => ({ ...p, manifest: e.target.value }))} placeholder="/site.webmanifest" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="favicon">Favicon</Label>
                  <Input id="favicon" value={s.favicon} onChange={(e) => setS((p) => ({ ...p, favicon: e.target.value }))} placeholder="/favicon.ico" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="icon32">Icon 32×32</Label>
                  <Input id="icon32" value={s.icon32} onChange={(e) => setS((p) => ({ ...p, icon32: e.target.value }))} placeholder="/icons/icon-32x32.png" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="icon180">Apple Touch 180×180</Label>
                  <Input id="icon180" value={s.icon180} onChange={(e) => setS((p) => ({ ...p, icon180: e.target.value }))} placeholder="/icons/apple-touch-icon.png" />
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Locale & Viewport
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lang">Lang / Locale</Label>
                  <Input id="lang" value={s.lang} onChange={(e) => setS((p) => ({ ...p, lang: e.target.value }))} placeholder="en, bn, en_US" />
                </div>
                <div className="space-y-1.5">
                  <Label>Direction</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={s.dir === 'ltr' ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, dir: 'ltr' }))}>
                      LTR
                    </Button>
                    <Button type="button" variant={s.dir === 'rtl' ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, dir: 'rtl' }))}>
                      RTL
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="viewport">Viewport</Label>
                  <Input id="viewport" value={s.viewport} onChange={(e) => setS((p) => ({ ...p, viewport: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Social */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Social (OG & Twitter)</CardTitle>
          <CardDescription>Configure Open Graph and Twitter cards.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Open Graph */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Open Graph
              </Label>
              <Switch checked={s.useOG} onCheckedChange={(v) => setS((p) => ({ ...p, useOG: v }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <div className="flex flex-wrap gap-2">
                  {(['website', 'article', 'product', 'profile', 'video.other'] as OgType[]).map((t) => (
                    <Button key={t} type="button" size="sm" variant={s.ogType === t ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, ogType: t }))}>
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ogurl">OG URL</Label>
                <Input id="ogurl" value={s.ogUrl} onChange={(e) => setS((p) => ({ ...p, ogUrl: e.target.value }))} placeholder="https://example.com/page" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ogimg" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Image (1200×630 recommended)
              </Label>
              <Input id="ogimg" value={s.ogImage} onChange={(e) => setS((p) => ({ ...p, ogImage: e.target.value }))} placeholder="https://example.com/og-image.jpg" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ogw">Width</Label>
                  <Input id="ogw" type="number" value={s.ogImageWidth} onChange={(e) => setS((p) => ({ ...p, ogImageWidth: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ogh">Height</Label>
                  <Input id="ogh" type="number" value={s.ogImageHeight} onChange={(e) => setS((p) => ({ ...p, ogImageHeight: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ogalt">Alt</Label>
                  <Input id="ogalt" value={s.ogImageAlt} onChange={(e) => setS((p) => ({ ...p, ogImageAlt: e.target.value }))} placeholder="Describe the image" />
                </div>
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Twitter className="h-4 w-4" /> Twitter
              </Label>
              <Switch checked={s.useTwitter} onCheckedChange={(v) => setS((p) => ({ ...p, useTwitter: v }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Card</Label>
              <div className="flex flex-wrap gap-2">
                {(['summary', 'summary_large_image', 'app', 'player'] as TwitterCard[]).map((t) => (
                  <Button key={t} type="button" size="sm" variant={s.twitterCard === t ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, twitterCard: t }))}>
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="twsite">@site</Label>
                <Input id="twsite" value={s.twitterSite} onChange={(e) => setS((p) => ({ ...p, twitterSite: e.target.value }))} placeholder="@yourbrand" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twcreator">@creator</Label>
                <Input id="twcreator" value={s.twitterCreator} onChange={(e) => setS((p) => ({ ...p, twitterCreator: e.target.value }))} placeholder="@yourhandle" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twimg">Image</Label>
              <Input id="twimg" value={s.twitterImage} onChange={(e) => setS((p) => ({ ...p, twitterImage: e.target.value }))} placeholder="https://example.com/social-image.jpg" />
              <div className="space-y-1.5">
                <Label htmlFor="twalt">Alt</Label>
                <Input id="twalt" value={s.twitterImageAlt} onChange={(e) => setS((p) => ({ ...p, twitterImageAlt: e.target.value }))} placeholder="Describe the image" />
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Live Previews */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          <CardDescription>How it’ll look on OG (Facebook/LinkedIn) and Twitter.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* OG Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Open Graph
                </Label>
                <p className="text-xs text-muted-foreground">{s.siteName || new URL(s.canonical || 'https://example.com').hostname}</p>
              </div>
              <Badge variant="secondary">1200×630</Badge>
            </div>

            <div className="rounded-xl border bg-background overflow-hidden">
              {previewImage ? (
                <div className="relative aspect-[1200/630] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImage} alt="OG" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[1200/630] grid place-items-center bg-muted text-muted-foreground">
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4" /> No image
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{s.siteName || (s.canonical ? new URL(s.canonical).hostname : 'Website')}</div>
                <div className="mt-1 line-clamp-2 font-semibold">{s.title || '(no title)'}</div>
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description || '(no description)'}</div>
              </div>
            </div>
          </div>

          {/* Twitter Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter Card
                </Label>
                <p className="text-xs text-muted-foreground">{s.twitterCard}</p>
              </div>
              <Badge variant="secondary">Summary</Badge>
            </div>

            <div className="rounded-xl border bg-background overflow-hidden">
              <div className="flex items-center gap-2 p-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.siteName || 'Website'}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.canonical ? new URL(s.canonical).hostname : 'example.com'}</div>
                </div>
              </div>

              {s.twitterCard === 'summary_large_image' ? (
                previewImage ? (
                  <div className="aspect-video bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="twitter" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video grid place-items-center bg-muted text-muted-foreground">
                    <div className="flex items-center gap-2 text-sm">
                      <ImageIcon className="h-4 w-4" /> No image
                    </div>
                  </div>
                )
              ) : null}

              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2">{s.title || '(no title)'}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{s.description || '(no description)'}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.canonical ? new URL(s.canonical).hostname : 'example.com'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Output */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generated Tags</CardTitle>
          <CardDescription>Paste these into your page’s &lt;head&gt;.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Textarea readOnly className="min-h-[320px] font-mono text-sm" value={output} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={copyOut}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
              </Button>
              <Button size="sm" className="gap-2" onClick={() => downloadTxt('meta-tags.html', output)}>
                <Download className="h-4 w-4" /> Download
              </Button>
              {s.canonical && (
                <a className="inline-flex" href={s.canonical} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" /> Open canonical
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tips</Label>
                <p className="text-xs text-muted-foreground">Keep titles concise and compelling; ensure OG/Twitter images are absolute URLs and publicly accessible.</p>
              </div>
              <Badge variant="secondary">{(output.match(/\n/g) || []).length + 1} lines</Badge>
            </div>

            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>
                Use <code>summary_large_image</code> for big Twitter previews.
              </li>
              <li>Recommended OG image: 1200×630 (≤2MB, JPG/PNG/WebP).</li>
              <li>
                Make <code>canonical</code> absolute (<code>https://</code>).
              </li>
              <li>
                For multi-language sites, also add <code>hreflang</code> links.
              </li>
              <li>
                Host icons at predictable paths and include a <code>manifest</code> for PWA.
              </li>
            </ul>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
