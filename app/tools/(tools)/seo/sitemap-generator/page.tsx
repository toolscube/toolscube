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

import { Calendar, Check, Copy, Download, FileCode, Files, Link as LinkIcon, ListChecks, RotateCcw, Settings, Wand2 } from 'lucide-react';

// ---------------- Types ----------------
type ChangeFreq = '' | 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

type Row = {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: string; // keep as string to preserve formatting (0.0-1.0)
};

type State = {
  // Input
  text: string;
  baseUrl: string; // prepended to relative paths
  keepTrailingSlash: boolean;
  forceHttps: boolean;

  // Defaults
  defaultChangefreq: ChangeFreq;
  defaultPriority: string; // '', '0.80', etc.
  lastmodMode: 'none' | 'today' | 'fromCSV'; // CSV or pipe format
  dateFormat: 'iso'; // reserved for future formats

  // Output
  pretty: boolean;
  maxUrlsPerFile: number; // split threshold (<= 50,000 recommended)
  filename: string; // sitemap.xml base name
  makeIndex: boolean; // create sitemap index if split

  // UI
  includeSampleHeaders: boolean;
};

type BuiltFile = { name: string; xml: string; bytes: number };

// ---------------- Defaults ----------------
const DEFAULT: State = {
  text: `https://example.com/
https://example.com/about
/about/team | 2024-12-10 | weekly | 0.6
/blog/my-post,2025-01-20,daily,0.8
/products
`,
  baseUrl: 'https://example.com',
  keepTrailingSlash: false,
  forceHttps: true,

  defaultChangefreq: 'weekly',
  defaultPriority: '',
  lastmodMode: 'fromCSV',
  dateFormat: 'iso',

  pretty: true,
  maxUrlsPerFile: 50000,
  filename: 'sitemap.xml',
  makeIndex: true,

  includeSampleHeaders: false,
};

// ---------------- Helpers ----------------
const uid = () => Math.random().toString(36).slice(2, 9);

function todayISO() {
  const d = new Date();
  // yyyy-mm-dd
  return d.toISOString().slice(0, 10);
}

function isAbsolute(url: string) {
  return /^https?:\/\//i.test(url);
}

function ensureAbsolute(url: string, base: string) {
  if (!url) return '';
  if (!isAbsolute(url)) {
    try {
      const u = new URL(url, base);
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

function normalizeUrl(u: string, opts: { keepSlash: boolean; forceHttps: boolean }) {
  try {
    const url = new URL(u);
    if (opts.forceHttps) url.protocol = 'https:';
    // normalize trailing slash
    const isRoot = url.pathname === '' || url.pathname === '/';
    if (!isRoot) {
      if (opts.keepSlash) {
        if (!url.pathname.endsWith('/')) url.pathname += '/';
      } else {
        if (url.pathname.endsWith('/')) url.pathname = url.pathname.replace(/\/+$/, '');
      }
    }
    // remove default ports
    if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
      url.port = '';
    }
    return url.toString();
  } catch {
    return u.trim();
  }
}

// very small, safe escaper for XML text nodes/attrs
function x(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function parseLineToRow(line: string, baseUrl: string): Row | null {
  let raw = line.trim();
  if (!raw) return null;
  if (raw.startsWith('#')) return null;

  // Accept 3 formats:
  // 1) plain URL or path
  // 2) pipe-separated: url | lastmod | changefreq | priority
  // 3) csv-like: url,lastmod,changefreq,priority
  let parts: string[] = [];
  if (raw.includes('|')) parts = raw.split('|').map((s) => s.trim());
  else if (raw.includes(',')) parts = raw.split(',').map((s) => s.trim());
  else parts = [raw];

  const [first, lastmod, changefreq, priority] = parts;
  if (!first) return null;

  const locAbs = ensureAbsolute(first, baseUrl);

  return {
    loc: locAbs,
    lastmod,
    changefreq: (changefreq as ChangeFreq) || undefined,
    priority: priority || undefined,
  };
}

// Build rows from input, normalize & dedupe, discard invalid
function buildRows(s: State): Row[] {
  const lines = s.text.split(/\r?\n/);
  const rows: Row[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const row = parseLineToRow(line, s.baseUrl);
    if (!row) continue;

    const normalized = normalizeUrl(row.loc, {
      keepSlash: s.keepTrailingSlash,
      forceHttps: s.forceHttps,
    });

    // validate absolute HTTP(S)
    if (!/^https?:\/\//i.test(normalized)) continue;

    if (seen.has(normalized)) continue;
    seen.add(normalized);

    rows.push({
      loc: normalized,
      lastmod: row.lastmod,
      changefreq: row.changefreq,
      priority: row.priority,
    });
  }
  return rows;
}

function applyDefaults(rows: Row[], s: State): Row[] {
  const out: Row[] = [];
  const today = todayISO();

  for (const r of rows) {
    const rr: Row = { ...r };

    // lastmod
    if (s.lastmodMode === 'today') {
      rr.lastmod = today;
    } else if (s.lastmodMode === 'fromCSV') {
      if (rr.lastmod && /^\d{4}-\d{2}-\d{2}$/.test(rr.lastmod)) {
        // ok
      } else if (!rr.lastmod) {
        // leave empty
      } else {
        // any other format -> try Date parse
        const d = new Date(rr.lastmod);
        if (!isNaN(d.getTime())) rr.lastmod = d.toISOString().slice(0, 10);
        else rr.lastmod = undefined;
      }
    } else {
      rr.lastmod = undefined;
    }

    // changefreq
    rr.changefreq = (rr.changefreq || s.defaultChangefreq || undefined) as ChangeFreq;

    // priority
    const p = (rr.priority ?? s.defaultPriority ?? '').trim();
    rr.priority = p ? clampPriority(p) : undefined;

    out.push(rr);
  }
  return out;
}

function clampPriority(p: string) {
  const n = Number(p);
  if (Number.isFinite(n)) {
    const c = Math.max(0, Math.min(1, n));
    return c.toFixed(2);
  }
  return '';
}

function chunk<T>(arr: T[], size: number) {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildSitemapXML(urlset: Row[], pretty: boolean) {
  const head = `<?xml version="1.0" encoding="UTF-8"?>\n` + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const tail = `</urlset>`;

  const urls = urlset.map((r) => {
    const parts = [
      `  <url>`,
      `    <loc>${x(r.loc)}</loc>`,
      ...(r.lastmod ? [`    <lastmod>${x(r.lastmod)}</lastmod>`] : []),
      ...(r.changefreq ? [`    <changefreq>${x(r.changefreq)}</changefreq>`] : []),
      ...(r.priority ? [`    <priority>${x(r.priority)}</priority>`] : []),
      `  </url>`,
    ];
    return parts.join('\n');
  });

  const body = urls.join('\n');
  const raw = head + (body ? body + '\n' : '') + tail;
  return pretty ? raw + '\n' : raw;
}

function buildIndexXML(parts: { loc: string; lastmod?: string }[], pretty: boolean) {
  const head = `<?xml version="1.0" encoding="UTF-8"?>\n` + `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const tail = `</sitemapindex>`;

  const nodes = parts.map((p) => {
    const inner = [`  <sitemap>`, `    <loc>${x(p.loc)}</loc>`, ...(p.lastmod ? [`    <lastmod>${x(p.lastmod)}</lastmod>`] : []), `  </sitemap>`];
    return inner.join('\n');
  });

  const body = nodes.join('\n');
  const raw = head + (body ? body + '\n' : '') + tail;
  return pretty ? raw + '\n' : raw;
}

function toBytes(s: string) {
  // rough utf-8 size
  return new TextEncoder().encode(s).length;
}

function downloadTxt(name: string, content: string) {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------- Page ----------------
export default function SitemapGeneratorPage() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sitemap-gen-v1');
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem('sitemap-gen-v1', JSON.stringify(s));
  }, [s]);

  const baseRows = React.useMemo(() => buildRows(s), [s]);
  const rows = React.useMemo(() => applyDefaults(baseRows, s), [baseRows, s]);

  const parts = React.useMemo(() => {
    const chunks = chunk(rows, Math.max(1, Math.min(50000, s.maxUrlsPerFile || 50000)));
    const files: BuiltFile[] = chunks.map((ch, i) => {
      const xml = buildSitemapXML(ch, s.pretty);
      const name = chunks.length === 1 ? s.filename : s.filename.replace(/\.xml$/i, '') + `-${i + 1}.xml`;
      return { name, xml, bytes: toBytes(xml) };
    });

    // Index
    if (s.makeIndex && files.length > 1) {
      // index file name
      const indexName = s.filename.replace(/\.xml$/i, '') + '-index.xml';

      // Determine each part's web URL if possible (heuristic: baseUrl + / + file name)
      const base = s.baseUrl?.replace(/\/+$/, '');
      const indexEntries = files.map((f) => ({
        loc: base ? `${base}/${f.name}` : f.name,
        lastmod: todayISO(),
      }));
      const indexXML = buildIndexXML(indexEntries, s.pretty);
      files.unshift({ name: indexName, xml: indexXML, bytes: toBytes(indexXML) });
    }

    return files;
  }, [rows, s.pretty, s.maxUrlsPerFile, s.filename, s.makeIndex, s.baseUrl]);

  const preview = parts[0];

  function resetAll() {
    setS(DEFAULT);
    setCopied(null);
  }

  async function copy(xml: string, key = 'xml') {
    await navigator.clipboard.writeText(xml);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  }

  const urlCount = rows.length;
  const fileCount = parts.length;
  const totalBytes = parts.reduce((a, b) => a + b.bytes, 0);

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <FileCode className="h-6 w-6" /> Sitemap.xml Generator
          </h1>
          <p className="text-sm text-muted-foreground">Build XML sitemaps from URL lists. Normalize, dedupe, set defaults, and export split files + optional index.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          {preview && (
            <>
              <Button variant="outline" onClick={() => copy(preview.xml, 'preview')} className="gap-2">
                {copied === 'preview' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Preview
              </Button>
              <Button onClick={() => downloadTxt(preview.name, preview.xml)} className="gap-2">
                <Download className="h-4 w-4" /> Download Preview
              </Button>
            </>
          )}
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Input URLs</CardTitle>
          <CardDescription>
            One per line (absolute or relative). Optional metadata via <code className="font-mono">|</code> or CSV.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea
            value={s.text}
            onChange={(e) => setS((p) => ({ ...p, text: e.target.value }))}
            className="min-h-[200px] font-mono"
            placeholder={`https://example.com/\n/about | 2025-01-18 | weekly | 0.7\n/blog/post-1,2024-12-20,monthly,0.5`}
          />
          {s.includeSampleHeaders && (
            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              Formats supported:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  <span className="font-mono">/path</span> or <span className="font-mono">https://domain.com/path</span>
                </li>
                <li>
                  <span className="font-mono">url | lastmod | changefreq | priority</span>
                </li>
                <li>
                  <span className="font-mono">url,lastmod,changefreq,priority</span>
                </li>
                <li>
                  <span className="font-mono">lastmod</span> prefers <span className="font-mono">YYYY-MM-DD</span>.
                </li>
              </ul>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="base" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Base URL (for relative paths)
              </Label>
              <Input id="base" value={s.baseUrl} onChange={(e) => setS((p) => ({ ...p, baseUrl: e.target.value.trim() }))} placeholder="https://example.com" />
            </div>
            <div className="rounded-md border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <Label>Keep trailing slash</Label>
                  <Switch checked={s.keepTrailingSlash} onCheckedChange={(v) => setS((p) => ({ ...p, keepTrailingSlash: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Force HTTPS</Label>
                  <Switch checked={s.forceHttps} onCheckedChange={(v) => setS((p) => ({ ...p, forceHttps: v }))} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                setS((p) => ({
                  ...p,
                  includeSampleHeaders: !p.includeSampleHeaders,
                }))
              }>
              <Wand2 className="h-4 w-4" /> Tips
            </Button>
            <Badge variant="secondary" className="font-normal">
              Parsed: {baseRows.length} raw → {rows.length} valid
            </Badge>
          </div>
        </CardContent>
      </GlassCard>

      {/* Defaults & Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Defaults & Settings</CardTitle>
          <CardDescription>Applied where a row doesn’t specify its own values.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Defaults
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>changefreq</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['', 'daily', 'weekly', 'monthly', 'yearly'] as ChangeFreq[]).map((f) => (
                      <Button key={f || 'none'} type="button" size="sm" variant={s.defaultChangefreq === f ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, defaultChangefreq: f }))}>
                        {f || 'none'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prio">priority</Label>
                  <Input id="prio" value={s.defaultPriority} onChange={(e) => setS((p) => ({ ...p, defaultPriority: e.target.value }))} placeholder="e.g., 0.80" />
                </div>
                <div className="space-y-1.5">
                  <Label>lastmod</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['none', 'today', 'fromCSV'] as const).map((m) => (
                      <Button key={m} type="button" size="sm" variant={s.lastmodMode === m ? 'default' : 'outline'} onClick={() => setS((p) => ({ ...p, lastmodMode: m }))}>
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Files className="h-4 w-4" /> Output files
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fname">Base filename</Label>
                  <Input id="fname" value={s.filename} onChange={(e) => setS((p) => ({ ...p, filename: e.target.value || 'sitemap.xml' }))} placeholder="sitemap.xml" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max">Max URLs per file</Label>
                  <Input
                    id="max"
                    type="number"
                    min={1}
                    max={50000}
                    value={s.maxUrlsPerFile}
                    onChange={(e) =>
                      setS((p) => ({
                        ...p,
                        maxUrlsPerFile: Math.max(1, Math.min(50000, Number(e.target.value) || 50000)),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Create index (sitemapindex)</Label>
                  <p className="text-xs text-muted-foreground">
                    Adds <span className="font-mono">*-index.xml</span> linking all parts.
                  </p>
                </div>
                <Switch checked={s.makeIndex} onCheckedChange={(v) => setS((p) => ({ ...p, makeIndex: v }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pretty print</Label>
                  <p className="text-xs text-muted-foreground">Appends a newline; keeps layout readable.</p>
                </div>
                <Switch checked={s.pretty} onCheckedChange={(v) => setS((p) => ({ ...p, pretty: v }))} />
              </div>
            </div>
          </div>

          {/* Stats & Quick Actions */}
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <ListChecks className="h-3.5 w-3.5" /> URLs: {urlCount}
                </Badge>
                <Badge variant="outline">Files: {fileCount}</Badge>
                <Badge variant="outline">{(totalBytes / 1024).toFixed(1)} KB total</Badge>
                <Badge variant="outline">{rows.filter((r) => r.lastmod).length} lastmod</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Limits: max 50,000 URLs or 50MB per file (uncompressed).</p>
            </div>

            {parts.length > 0 && (
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label>Download all</Label>
                  <div className="flex flex-wrap gap-2">
                    {parts.map((f, i) => (
                      <Button key={f.name + i} size="sm" variant="outline" onClick={() => downloadTxt(f.name, f.xml)}>
                        <Download className="h-4 w-4 mr-1" /> {f.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Tips</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use absolute URLs where possible. Relative paths are resolved against <span className="font-mono">{s.baseUrl || 'your base URL'}</span>.
                </li>
                <li>
                  Provide <span className="font-mono">lastmod</span> as <span className="font-mono">YYYY-MM-DD</span> for best compatibility.
                </li>
                <li>Submit the index file to search engines if you split into parts.</li>
                <li>Don’t include non-canonical or blocked (robots) URLs.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Preview */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>First file’s XML. Copy or download each file above.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Textarea readOnly className="min-h-[320px] font-mono text-sm" value={preview ? preview.xml : '<urlset />'} />
            <div className="flex flex-wrap gap-2">
              {preview && (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => copy(preview.xml, 'preview2')}>
                    {copied === 'preview2' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => downloadTxt(preview.name, preview.xml)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Validation checklist</Label>
                <p className="text-xs text-muted-foreground">Quick sanity checks for common issues.</p>
              </div>
              <Badge variant="secondary">XML</Badge>
            </div>

            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>
                URLs start with <code>http(s)://</code> and point to the final canonical location.
              </li>
              <li>No more than 50,000 URLs per file; each file ≤ 50MB.</li>
              <li>
                <code>lastmod</code> uses <code>YYYY-MM-DD</code> and reflects actual updates.
              </li>
              <li>
                Use a <code>sitemapindex</code> if you have multiple sitemap parts.
              </li>
              <li>
                Reference your sitemap(s) in <code>robots.txt</code> for discovery.
              </li>
            </ul>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-4 w-4" />
                Generated: {todayISO()}
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
