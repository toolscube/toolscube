'use client';

import { CopyButton } from '@/components/shared/action-buttons';
import { ColorField } from '@/components/shared/color-field';
import { InputField } from '@/components/shared/form-fields/input-field';
import { QRCodeBox } from '@/components/shared/qr-code';

import ToolPageHeader from '@/components/shared/tool-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQrExport } from '@/hooks/use-qr-export';

import { createShort } from '@/lib/actions/shortener.action';
import { timeAgo } from '@/lib/utils/time-ago';

import { BarChart2, CalendarClock, Download, ExternalLink, Grip, Link2, Link as LinkIcon, PaintBucket, QrCode, RefreshCcw, ShieldCheck, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

/* ---------- Types & LS helpers ---------- */

type RecentItem = { slug: string; url: string; createdAt: number };
const RECENT_KEY = 'shortener:recent:v1';

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

/* Component */

export default function ShortenerClient() {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [recent, setRecent] = useState<RecentItem[]>([]);

  // QR settings
  const [qrSize, setQrSize] = useState<number>(160);
  const [qrMargin, setQrMargin] = useState<number>(1);
  const [qrECC, setQrECC] = useState<ECC>('M');
  const [qrDark, setQrDark] = useState<string>('#000000');
  const [qrLight, setQrLight] = useState<string>('#ffffff');

  useEffect(() => setRecent(loadRecent()), []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shortUrl = useMemo(() => (slug ? `${origin}/${slug}` : ''), [origin, slug]);
  const interstitialUrl = useMemo(() => (slug ? `${origin}/tools/url/shortener/interstitial/${slug}` : ''), [origin, slug]);
  const analyticsUrl = useMemo(() => (slug ? `${origin}/tools/url/shortener/analytics/${slug}` : ''), [origin, slug]);

  const { downloadPNG, downloadSVG } = useQrExport({
    value: shortUrl || 'https://example.com',
    size: qrSize,
    margin: qrMargin,
    ecl: qrECC,
    fg: qrDark,
    bg: qrLight,
    quietZone: true,
    logo: null,
  });

  /* Actions */

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

    const item: RecentItem = {
      slug: res.link.short,
      url: res.link.targetUrl,
      createdAt: Date.now(),
    };
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
    <>
      <ToolPageHeader
        icon={Link2}
        title="URL Shortener"
        description="Shorten links with custom slugs & analytics"
        actions={<CopyButton getText={() => (typeof window !== 'undefined' ? window.location.href : '')} label="Copy Link" />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <GlassCard className="p-4">
          <div className="text-sm text-muted-foreground">Your shortest link</div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-muted px-2 py-1 text-sm">{shortUrl || '—'}</code>

            <CopyButton getText={() => shortUrl || ''} label="Copy" copiedLabel="Copied" variant="ghost" size="sm" disabled={!shortUrl} className="gap-2" />

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
            <InputField
              id="qr-size"
              type="number"
              value={qrSize}
              min={96}
              max={1024}
              parseNumber
              label="Size"
              className="space-y-1"
              onChange={(e) => {
                const n = e.target.value === '' ? 160 : Number(e.target.value);
                setQrSize(Math.min(1024, Math.max(96, n)));
              }}
            />

            <InputField
              id="qr-margin"
              type="number"
              value={qrMargin}
              min={0}
              max={8}
              parseNumber
              label="Margin"
              className="space-y-1"
              onChange={(e) => {
                const n = e.target.value === '' ? 0 : Number(e.target.value);
                setQrMargin(Math.min(8, Math.max(0, n)));
              }}
            />

            <div className="space-y-1">
              <Label className="text-xs">ECC</Label>
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
            <ColorField
              id="qr-dark"
              value={qrDark}
              onChange={setQrDark}
              labelNode={
                <span className="text-xs flex items-center gap-1">
                  <PaintBucket className="h-3.5 w-3.5" /> Dark
                </span>
              }
            />
            <ColorField
              id="qr-light"
              value={qrLight}
              onChange={setQrLight}
              labelNode={
                <span className="text-xs flex items-center gap-1">
                  <PaintBucket className="h-3.5 w-3.5" /> Light
                </span>
              }
            />
          </div>
        </GlassCard>

        {/* QR Preview + Export using reusable component */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">QR Code</div>
            <Badge variant="secondary" className="gap-1">
              <Grip className="h-3.5 w-3.5" />
              Customizable
            </Badge>
          </div>

          <div className="mt-3 flex flex-col items-center gap-3">
            <div className="rounded-lg border p-3 bg-background/60">
              <QRCodeBox
                value={shortUrl}
                format="png"
                size={qrSize}
                margin={qrMargin}
                ecl={qrECC}
                fg={qrDark}
                bg={qrLight}
                quietZone
                // optional: canvas/svg classes
                canvasClassName="h-auto w-[160px] sm:w-[200px] md:w-[220px]"
              />
            </div>

            {shortUrl ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-2" onClick={() => downloadPNG(`qr-${slug || 'link'}.png`, 2)}>
                  <Download className="h-4 w-4" /> PNG
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => downloadSVG(`qr-${slug || 'link'}.svg`)}>
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
            <InputField
              id="dest-url"
              type="url"
              placeholder="Enter your URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              inputClassName="bg-background/60 backdrop-blur"
              className="flex-1"
            />
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
                        <CopyButton getText={() => sUrl} label="Copy" copiedLabel="Copied" variant="outline" size="sm" className="gap-2" />
                      </TooltipTrigger>
                      <TooltipContent>Copy short link</TooltipContent>
                    </Tooltip>

                    {/* QR popover (uses reusable component at small size) */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                          <QrCode className="h-4 w-4" />
                          QR
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4">
                        <div className="flex flex-col items-center gap-2">
                          <QRCodeBox value={sUrl} size={144} margin={1} ecl="M" fg="#000000" bg="#ffffff" quietZone />
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

                    <Button onClick={() => removeRecent(it.slug)} size="sm" variant="outline">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </>
  );
}
