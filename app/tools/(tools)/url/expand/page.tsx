'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, Copy, ExternalLink, Key, Link2, RotateCcw, Search, ShieldAlert, Unlink2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type Hop = {
  index: number;
  url: string;
  status: number;
  statusText: string;
  location?: string | null;
};

type Meta = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  finalUrl?: string;
  contentType?: string;
};

type Result = {
  ok: boolean;
  inputUrl: string;
  finalUrl: string;
  totalHops: number;
  hops: Hop[];
  meta?: Meta;
  error?: string;
  startedAt: string; // ISO
  ms: number;
};

const DEFAULT_MAX_HOPS = 10;

function formatUrl(s: string) {
  try {
    const u = new URL(s.trim().replace(/\s+/g, ''));
    return u.toString();
  } catch {
    // Try to add protocol
    try {
      return new URL(`https://${s}`).toString();
    } catch {
      return s;
    }
  }
}

function isLikelyShortener(host: string) {
  const list = ['bit.ly', 't.co', 'goo.gl', 'tinyurl.com', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly', 'shorte.st', 'rb.gy', 'lnkd.in', 'fb.me', 'bl.ink', 't.ly'];
  return list.some((d) => host.endsWith(d));
}

function csvDownload(filename: string, rows: string[][]) {
  const csv = rows.map((r) =>
    r
      .map((cell) => {
        const v = (cell ?? '').toString().replace(/"/g, '""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
      })
      .join(','),
  );
  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LinkExpandPage() {
  const [url, setUrl] = useState('');
  const [maxHops, setMaxHops] = useState<number>(DEFAULT_MAX_HOPS);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);

  const parsedHost = useMemo(() => {
    try {
      return new URL(formatUrl(url)).host;
    } catch {
      return '';
    }
  }, [url]);

  const risky = useMemo(() => {
    if (!parsedHost) return false;
    return isLikelyShortener(parsedHost.toLowerCase());
  }, [parsedHost]);

  async function expand() {
    const clean = formatUrl(url);
    try {
      new URL(clean);
    } catch {
      setResult({
        ok: false,
        inputUrl: url,
        finalUrl: '',
        totalHops: 0,
        hops: [],
        error: 'Invalid URL. Please enter a valid URL (e.g., https://example.com).',
        startedAt: new Date().toISOString(),
        ms: 0,
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const t0 = performance.now();
      const res = await fetch('/api/link-expand', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: clean, maxHops }),
      });
      const data = (await res.json()) as Result;
      const t1 = performance.now();
      const final: Result = { ...data, ms: Math.round(t1 - t0) };
      setResult(final);
      setHistory((h) => [final, ...h].slice(0, 20));
    } catch (e: any) {
      setResult({
        ok: false,
        inputUrl: clean,
        finalUrl: '',
        totalHops: 0,
        hops: [],
        error: e?.message ?? 'Failed to expand link.',
        startedAt: new Date().toISOString(),
        ms: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setUrl('');
    setMaxHops(DEFAULT_MAX_HOPS);
    setResult(null);
    setCopied(null);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  }

  function exportCSV() {
    if (!history.length) return;
    const rows: string[][] = [
      ['Time', 'Input URL', 'Final URL', 'OK', 'Hops', 'Duration(ms)'],
      ...history.map((r) => [new Date(r.startedAt).toLocaleString(), r.inputUrl, r.finalUrl, String(r.ok), String(r.totalHops), String(r.ms)]),
    ];
    csvDownload('link-expand-history.csv', rows);
  }

  const meta = result?.meta;

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Link2 className="h-6 w-6" /> Link Expander
          </h1>
          <p className="text-sm text-muted-foreground">Unshorten links, inspect redirect chain, and preview the final destination safely.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={expand} className="gap-2" disabled={loading}>
            {loading ? <Search className="h-4 w-4 animate-pulse" /> : <Unlink2 className="h-4 w-4" />} {loading ? 'Expanding...' : 'Expand'}
          </Button>
        </div>
      </GlassCard>

      {/* Input & Options */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
          <CardDescription>Enter a short or tracking link to reveal the final URL.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <div className="flex gap-2">
              <Input id="url" placeholder="https://bit.ly/xyz or https://t.co/abc..." value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && expand()} />
              <Button variant="secondary" onClick={() => copyText(url)} className="gap-2" disabled={!url}>
                {copied === url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </Button>
            </div>
            {!!parsedHost && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant={risky ? 'destructive' : 'secondary'}>{parsedHost}</Badge>
                {risky && (
                  <span className="inline-flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Known shortener detected
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxHops">Max Redirect Hops</Label>
            <Input id="maxHops" type="number" min={1} max={30} value={maxHops} onChange={(e) => setMaxHops(Math.min(30, Math.max(1, Number(e.target.value) || DEFAULT_MAX_HOPS)))} />
            <p className="text-xs text-muted-foreground">Prevents infinite loops. Default {DEFAULT_MAX_HOPS}.</p>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Result */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
          <CardDescription>Redirect chain & final destination details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && <p className="text-sm text-muted-foreground">No expansion yet. Paste a URL and click Expand.</p>}

          {result && (
            <>
              {/* Summary */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Input</div>
                  <div className="mt-1 break-all">{result.inputUrl}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Final URL</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => copyText(result.finalUrl)} disabled={!result.finalUrl}>
                        {copied === result.finalUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => result.finalUrl && window.open(result.finalUrl, '_blank', 'noopener')} disabled={!result.finalUrl}>
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 break-all">{result.finalUrl || '—'}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {result.ok ? (
                  <>
                    Resolved in <strong>{result.ms} ms</strong> with <strong>{result.totalHops}</strong> hop
                    {result.totalHops === 1 ? '' : 's'}.
                  </>
                ) : (
                  <>
                    <span className="text-red-500">Failed:</span> {result.error || 'Unknown error'}.
                  </>
                )}
              </div>

              {/* Hop-by-hop */}
              <div className="rounded-md border">
                <div className="px-3 py-2 border-b text-sm font-medium">Redirect Chain</div>
                <div className="divide-y">
                  {result.hops.length === 0 && <div className="p-3 text-sm text-muted-foreground">No redirects.</div>}
                  {result.hops.map((h) => (
                    <div key={h.index} className="p-3 text-sm flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs">{h.url}</div>
                        <Badge variant={h.status >= 300 && h.status < 400 ? 'secondary' : h.status >= 400 ? 'destructive' : 'default'}>
                          {h.status} {h.statusText}
                        </Badge>
                      </div>
                      {h.location && (
                        <div className="text-xs text-muted-foreground">
                          ➜ <span className="font-mono">{h.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta preview */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input readOnly value={meta?.title || meta?.ogTitle || ''} placeholder="—" />
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Input readOnly value={meta?.contentType || ''} placeholder="—" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea readOnly className="min-h-[80px]" value={meta?.ogDescription || meta?.description || ''} placeholder="—" />
                </div>
                {!!meta?.ogImage && (
                  <div className="sm:col-span-2">
                    <Label>Preview Image</Label>
                    <div className="mt-2 rounded-lg border p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={meta.ogImage} alt="Open Graph" className="max-h-64 w-full object-contain rounded-md" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </GlassCard>

      <Separator />

      {/* History */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Recent lookups (last 20). Data stays in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!history.length} className="gap-2">
              <Key className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className={cn('rounded-md border overflow-hidden', history.length ? '' : 'p-3 text-sm text-muted-foreground')}>
            {!history.length && 'No history yet.'}
            {!!history.length && (
              <div className="divide-y">
                {history.map((h, i) => (
                  <div key={i} className="p-3 text-sm grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        {new Date(h.startedAt).toLocaleString()} • {h.ms} ms • {h.totalHops} hop{h.totalHops === 1 ? '' : 's'}
                      </div>
                      <div className="mt-1 line-clamp-1 break-all">{h.inputUrl}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 break-all">{h.finalUrl}</div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setResult(h)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(h.finalUrl, '_blank', 'noopener')}>
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
