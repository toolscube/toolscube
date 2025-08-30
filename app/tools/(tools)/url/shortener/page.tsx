'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createShort } from '@/lib/actions/shortener';

import {
  BarChart2,
  CalendarClock,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Link as LinkIcon,
  MoreHorizontal,
  PaintBucket,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import * as QRCodeLib from 'qrcode';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type RecentItem = { slug: string; url: string; createdAt: number };
const RECENT_KEY = 'shortener:recent:v1';

/* ---------- Local storage helpers ---------- */
function loadRecent(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentItem[]) : [];
  } catch {
    return [];
  }
}
function saveRecent(items: RecentItem[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {}
}

/* ---------- Small utils ---------- */
const timeAgo = (ts: number) => {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

type ECC = 'L' | 'M' | 'Q' | 'H';

export default function UrlShortenerPage() {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [recent, setRecent] = useState<RecentItem[]>([]);

  // QR settings
  const [qrSize, setQrSize] = useState<number>(160);
  const [qrMargin, setQrMargin] = useState<number>(1);
  const [qrECC, setQrECC] = useState<ECC>('M');
  const [qrDark, setQrDark] = useState<string>('#000000');
  const [qrLight, setQrLight] = useState<string>('#ffffff');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => setRecent(loadRecent()), []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const shortUrl = useMemo(() => (slug ? `${origin}/${slug}` : ''), [origin, slug]);
  const interstitialUrl = useMemo(() => (slug ? `${origin}/tools/url/shortener/interstitial/${slug}` : ''), [origin, slug]);
  const analyticsUrl = useMemo(() => (slug ? `${origin}/tools/url/shortener/analytics/${slug}` : ''), [origin, slug]);

  /* ------------------------------ QR Render ------------------------------ */
  const renderQR = async () => {
    if (!shortUrl || !canvasRef.current) return;
    try {
      await QRCodeLib.toCanvas(canvasRef.current, shortUrl, {
        errorCorrectionLevel: qrECC,
        margin: qrMargin,
        width: qrSize,
        color: { dark: qrDark, light: qrLight },
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    renderQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortUrl, qrSize, qrMargin, qrECC, qrDark, qrLight]);

  const downloadQRPNG = () => {
    if (!canvasRef.current || !shortUrl) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = `qr-${slug || 'link'}.png`;
    a.click();
  };

  const downloadQRSVG = async () => {
    if (!shortUrl) return;
    try {
      const svgString = await QRCodeLib.toString(shortUrl, {
        type: 'svg',
        errorCorrectionLevel: qrECC,
        margin: qrMargin,
        width: qrSize,
        color: { dark: qrDark, light: qrLight },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${slug || 'link'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  /* ------------------------------ Actions ------------------------------ */
  const handleCopy = async (text: string, rowSlug?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
      if (rowSlug) {
        setCopiedSlug(rowSlug);
        setTimeout(() => setCopiedSlug(null), 1000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 900);
      }
    } catch {
      toast.error('Copy failed');
    }
  };

  const removeRecent = (rowSlug: string) => {
    const next = recent.filter((i) => i.slug !== rowSlug);
    setRecent(next);
    saveRecent(next);
  };

  const onShorten = async () => {
    if (!url.trim()) return;
    setStatus('saving');
    const res = await createShort({ url });
    if (!res.ok) {
      setStatus('error');
      toast.error('Invalid URL!');
      return;
    }
    setSlug(res.link.short);

    // store to recent (dedupe by slug)
    const item: RecentItem = { slug: res.link.short, url: res.link.targetUrl, createdAt: Date.now() };
    const next = [item, ...loadRecent().filter((i) => i.slug !== item.slug)].slice(0, 12);
    setRecent(next);
    saveRecent(next);

    setStatus('done');
  };

  const reset = () => {
    setUrl('');
    setSlug('');
    setStatus('idle');
  };

  return (
    <MotionGlassCard className="p-6">
      {/* Header */}
      <GlassCard className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Link2 className="h-6 w-6" />
            URL Shortener
          </h1>
          <p className="text-sm text-muted-foreground">Paste a link and get the shortest possible domain/slug. Anonymous by default. If a URL was shortened before, you’ll get the same short link.</p>
        </div>
      </GlassCard>

      {/* ===== Result FIRST ===== */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <GlassCard className="p-4">
          <div className="text-sm text-muted-foreground">Your shortest link</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-muted px-2 py-1 text-sm">{shortUrl || '—'}</code>

            <Button variant="ghost" size="sm" onClick={() => shortUrl && handleCopy(shortUrl)} className="gap-2" disabled={!shortUrl}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <Link href={shortUrl || '#'} target={shortUrl ? '_blank' : undefined} aria-disabled={!shortUrl}>
              <Button variant="outline" size="sm" className="gap-2" disabled={!shortUrl}>
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </Link>

            <Link href={analyticsUrl || '#'} aria-disabled={!shortUrl}>
              <Button variant="outline" size="sm" className="gap-2" disabled={!shortUrl}>
                <BarChart2 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>

            <Link href={interstitialUrl || '#'} aria-disabled={!shortUrl}>
              <Button variant="outline" size="sm" className="gap-2" disabled={!shortUrl}>
                <ShieldCheck className="h-4 w-4" />
                Interstitial
              </Button>
            </Link>
          </div>

          {!shortUrl && <p className="mt-2 text-xs text-muted-foreground">Your short link will appear here after you shorten a URL.</p>}

          {/* Compact Controls */}
          <div className="grid w-full grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="qr-size" className="text-xs">
                Size
              </Label>
              <Input id="qr-size" type="number" min={96} max={1024} value={qrSize} onChange={(e) => setQrSize(Math.min(1024, Math.max(96, Number(e.target.value) || 160)))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="qr-margin" className="text-xs">
                Margin
              </Label>
              <Input id="qr-margin" type="number" min={0} max={8} value={qrMargin} onChange={(e) => setQrMargin(Math.min(8, Math.max(0, Number(e.target.value) || 0)))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="qr-ecc" className="text-xs">
                ECC
              </Label>
              <div className="flex gap-1">
                {(['L', 'M', 'Q', 'H'] as ECC[]).map((level) => (
                  <Button key={level} size="sm" variant={qrECC === level ? 'default' : 'outline'} className="px-2" onClick={() => setQrECC(level)}>
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="qr-dark" className="text-xs flex items-center gap-1">
                <PaintBucket className="h-3.5 w-3.5" /> Dark
              </Label>
              <Input id="qr-dark" type="color" value={qrDark} onChange={(e) => setQrDark(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="qr-light" className="text-xs flex items-center gap-1">
                <PaintBucket className="h-3.5 w-3.5" /> Light
              </Label>
              <Input id="qr-light" type="color" value={qrLight} onChange={(e) => setQrLight(e.target.value)} />
            </div>
          </div>
        </GlassCard>

        {/* QR Preview + Controls */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">QR Code</div>
            <Badge variant="secondary" className="gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Customizable
            </Badge>
          </div>

          <div className="mt-3 flex flex-col items-center gap-3">
            <div className="rounded-lg border p-3 bg-background/60">
              {/* Canvas-based QR (qrcode package) */}
              <canvas ref={canvasRef} width={qrSize} height={qrSize} className="h-auto w-[160px] sm:w-[200px] md:w-[220px]" />
            </div>

            {shortUrl ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-2" onClick={downloadQRPNG}>
                  <Download className="h-4 w-4" /> PNG
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={downloadQRSVG}>
                  <Download className="h-4 w-4" /> SVG
                </Button>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">QR appears after you create a link.</div>
            )}
          </div>
        </GlassCard>
      </div>

      <Separator className="my-6" />

      {/* ===== Create link ===== */}
      <GlassCard className="p-4">
        <div className="grid gap-2">
          <Label>Destination URL</Label>
          <div className="flex gap-2">
            <Input type="url" placeholder="Enter your URL..." value={url} onChange={(e) => setUrl(e.target.value)} className="bg-background/60 backdrop-blur" />
            <Button onClick={onShorten} disabled={!url || status === 'saving'} className="gap-2">
              <LinkIcon className="h-4 w-4" />
              {status === 'saving' ? 'Shortening…' : 'Shorten'}
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Make another
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            We normalize URLs automatically (adds <code className="rounded-md bg-muted px-2 py-1 text-xs">https://</code> if missing).
          </p>
        </div>
      </GlassCard>

      <Separator className="my-6" />

      {/* ===== Recent history (local) ===== */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Recent</div>
          {recent.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRecent([]);
                saveRecent([]);
              }}>
              Clear
            </Button>
          )}
        </div>

        {recent.length === 0 && <div className="text-xs text-muted-foreground">No links yet. Create your first short link above.</div>}

        <TooltipProvider>
          <div className="grid md:grid-cols-2 gap-2">
            {recent.slice(0, 8).map((it) => {
              const sUrl = `${origin}/${it.slug}`;
              const aUrl = `${origin}/tools/url/shortener/analytics/${it.slug}`;

              const host = (() => {
                try {
                  return new URL(it.url).hostname;
                } catch {
                  return it.url;
                }
              })();

              return (
                <GlassCard key={it.slug} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  {/* Left: favicon + URLs */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border bg-background/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={`${host} favicon`} src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-medium">{sUrl}</div>
                        <Badge variant="secondary" className="hidden sm:inline-flex gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {timeAgo(it.createdAt)}
                        </Badge>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">→ {it.url}</div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2">
                    {/* Copy */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleCopy(sUrl, it.slug)}>
                          {copiedSlug === it.slug ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy short link</TooltipContent>
                    </Tooltip>

                    {/* QR popover (canvas re-render on open) */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                          <QrCode className="h-4 w-4" />
                          QR
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4">
                        <div className="flex flex-col items-center gap-2">
                          <InlineQR value={sUrl} size={144} />
                          <div className="break-all text-center text-xs text-muted-foreground">{sUrl}</div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Open */}
                    <Link href={sUrl} target="_blank">
                      <Button size="sm" variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </Link>

                    {/* Analytics */}
                    <Link href={aUrl}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Analytics
                      </Button>
                    </Link>

                    {/* More (delete) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem onClick={() => removeRecent(it.slug)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove from recent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </MotionGlassCard>
  );
}

/* Inline canvas QR for popovers (also uses qrcode) */
function InlineQR({ value, size = 144 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCodeLib.toCanvas(ref.current, value, { width: size, margin: 1 });
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} className="h-auto w-[144px]" />;
}
