'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Check, ClipboardPaste, Copy, Download, Link as LinkIcon, Plus, Regex as RegexIcon, RotateCcw, Save, Search, Sparkles, Trash2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

// -----------------------------
// Library Data
// -----------------------------
type Pattern = {
  id: string;
  title: string;
  description: string;
  pattern: string; // raw source without /.../
  flags?: string; // e.g., "gi"
  category: 'Text' | 'Web' | 'Numbers' | 'Security' | 'System' | 'Bangla';
  sample?: string;
};

const LIBRARY: Pattern[] = [
  // Web
  {
    id: 'email',
    title: 'Email (simple, practical)',
    description: 'Basic RFC-lite email matcher for most use cases.',
    pattern: String.raw`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}`,
    flags: 'g',
    category: 'Web',
    sample: 'hello@example.com, admin@mail.io',
  },
  {
    id: 'url',
    title: 'URL (http/https)',
    description: 'Matches common http/https URLs with optional query/hash.',
    pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*`,
    flags: 'gi',
    category: 'Web',
    sample: 'Visit https://tariqul.dev or http://example.org?q=1#top',
  },
  {
    id: 'slug',
    title: 'Slug (kebab-case)',
    description: 'Lowercase letters, digits and hyphens.',
    pattern: String.raw`^[a-z0-9]+(?:-[a-z0-9]+)*$`,
    flags: '',
    category: 'Web',
    sample: 'projects',
  },

  // Numbers
  {
    id: 'integer',
    title: 'Integer (signed)',
    description: 'Optional leading +/-, then digits.',
    pattern: String.raw`^[+-]?\d+$`,
    flags: '',
    category: 'Numbers',
    sample: '-42, 0, +99',
  },
  {
    id: 'number',
    title: 'Number (int/float)',
    description: 'Optional sign, optional decimals.',
    pattern: String.raw`^[+-]?(?:\d+\.?\d*|\.\d+)$`,
    flags: '',
    category: 'Numbers',
    sample: '3, -2.5, .75, +10.0',
  },
  {
    id: 'currency',
    title: 'Currency (BDT style)',
    description: 'Digits with optional commas and decimals.',
    pattern: String.raw`^\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?$`,
    flags: '',
    category: 'Numbers',
    sample: '1,200,500.00',
  },

  // Security
  {
    id: 'strong-password',
    title: 'Strong password (8+ with mix)',
    description: 'At least 8 chars, upper, lower, number, symbol.',
    pattern: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$`,
    flags: '',
    category: 'Security',
    sample: 'Aa1!aaaa',
  },
  {
    id: 'hex-color',
    title: 'Hex color (#RGB/#RRGGBB)',
    description: '3 or 6 hex digits after #.',
    pattern: String.raw`^#(?:[0-9a-fA-F]{3}){1,2}$`,
    flags: '',
    category: 'Security',
    sample: '#0fa, #0F0F0F',
  },

  // System
  {
    id: 'uuid-v4',
    title: 'UUID v4',
    description: 'Canonical lowercase/uppercase variants.',
    pattern: String.raw`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`,
    flags: '',
    category: 'System',
    sample: '123e4567-e89b-12d3-a456-426614174000',
  },
  {
    id: 'ipv4',
    title: 'IPv4 address',
    description: '0–255 dot-separated quads.',
    pattern: String.raw`^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$`,
    flags: '',
    category: 'System',
    sample: '192.168.0.1',
  },

  // Text
  {
    id: 'trim-spaces',
    title: 'Trim extra spaces (find)',
    description: 'Multiple spaces for replacement.',
    pattern: String.raw`\s{2,}`,
    flags: 'g',
    category: 'Text',
    sample: 'hello   world',
  },
  {
    id: 'words',
    title: 'Words (ASCII)',
    description: 'Word tokens split.',
    pattern: String.raw`\b\w+\b`,
    flags: 'g',
    category: 'Text',
    sample: 'This is a test.',
  },

  // Bangla
  {
    id: 'bd-mobile',
    title: 'Bangladesh mobile (+880 / 01)',
    description: 'Typical Bangladeshi mobile formats.',
    pattern: String.raw`^(?:\+?88)?01[3-9]\d{8}$`,
    flags: '',
    category: 'Bangla',
    sample: '+8801712345678, 01712345678',
  },
  {
    id: 'bangla-letters',
    title: 'Bangla letters',
    description: 'Matches Bangla letters (একাধিক).',
    pattern: String.raw`[\u0980-\u09FF]+`,
    flags: 'g',
    category: 'Bangla',
    sample: 'প্রাকৃতিক চিকিৎসা',
  },
];

// -----------------------------
// Helpers
// -----------------------------
function escapeForDisplay(src: string) {
  return src.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
function safeWindow() {
  return typeof window !== 'undefined' ? window : undefined;
}

function buildRegex(src: string, flags: string) {
  try {
    return { re: new RegExp(src, flags), error: null as string | null };
  } catch (e: any) {
    return { re: null as RegExp | null, error: e?.message ?? 'Invalid regex' };
  }
}

type MatchRow = { match: string; index: number; groups?: Record<string, string | undefined> };

function collectMatches(text: string, re: RegExp | null): MatchRow[] {
  if (!re || !text) return [];
  const g = re.global ? re : new RegExp(re.source, re.flags + 'g');
  const rows: MatchRow[] = [];
  for (const m of text.matchAll(g)) {
    rows.push({
      match: m[0] ?? '',
      index: m.index ?? -1,
      groups: m.groups ?? undefined,
    });
    // guard against zero-length infinite loop
    if (m[0]?.length === 0) {
      const nextIndex = (m.index ?? 0) + 1;
      if (nextIndex >= text.length) break;
      g.lastIndex = nextIndex;
    }
  }
  return rows;
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function encodeShare(p: { pattern: string; flags: string; text: string; replace: string }) {
  const payload = new URLSearchParams({
    re: p.pattern,
    f: p.flags,
    t: p.text,
    r: p.replace,
  }).toString();
  return `?${payload}`;
}
function decodeShare(search: string) {
  const sp = new URLSearchParams(search);
  return {
    pattern: sp.get('re') ?? '',
    flags: sp.get('f') ?? '',
    text: sp.get('t') ?? '',
    replace: sp.get('r') ?? '',
  };
}

// -----------------------------
// Page Component
// -----------------------------
export default function RegexLibraryPage() {
  // Search & filter
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState<'All' | Pattern['category']>('All');

  // Tester state
  const [pattern, setPattern] = React.useState<string>(LIBRARY[0].pattern);
  const [flags, setFlags] = React.useState<Record<'g' | 'i' | 'm' | 's' | 'u' | 'y', boolean>>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [testText, setTestText] = React.useState<string>(LIBRARY[0].sample ?? '');
  const [replace, setReplace] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [runMs, setRunMs] = React.useState<number | null>(null);

  // Favorites
  type Fav = { id: string; title: string; pattern: string; flags: string };
  const [favs, setFavs] = React.useState<Fav[]>([]);

  // Quick inserts
  const QUICK = React.useMemo(
    () => [
      { label: 'Digits (\\d+)', value: String.raw`\d+` },
      { label: 'Word (\\w+)', value: String.raw`\w+` },
      { label: 'Whitespace (\\s+)', value: String.raw`\s+` },
      { label: 'Start ^', value: '^' },
      { label: 'End $', value: '$' },
      { label: 'Word boundary \\b', value: String.raw`\b` },
      { label: 'Group ()', value: '($1)' }, // placeholder for cursor idea
      { label: 'Named (?<name>)', value: String.raw`(?<name>...)` },
    ],
    [],
  );

  // Parse share URL on mount
  React.useEffect(() => {
    const w = safeWindow();
    if (!w) return;
    const { pattern: ps, flags: fs, text: ts, replace: rs } = decodeShare(w.location.search);
    if (ps || fs || ts || rs) {
      setPattern(ps || LIBRARY[0].pattern);
      const next: any = { g: false, i: false, m: false, s: false, u: false, y: false };
      for (const ch of fs || '') if (ch in next) next[ch] = true;
      setFlags(next);
      setTestText(ts || '');
      setReplace(rs || '');
    }
  }, []);

  // Load favorites
  React.useEffect(() => {
    const w = safeWindow();
    if (!w) return;
    try {
      const saved = w.localStorage.getItem('regex-favs');
      if (saved) setFavs(JSON.parse(saved));
    } catch {}
  }, []);
  const saveFavs = React.useCallback((list: Fav[]) => {
    const w = safeWindow();
    setFavs(list);
    if (!w) return;
    try {
      w.localStorage.setItem('regex-favs', JSON.stringify(list));
    } catch {}
  }, []);

  const flagsStr = React.useMemo(() => (['g', 'i', 'm', 's', 'u', 'y'] as const).filter((f) => flags[f]).join(''), [flags]);
  const { re, error: buildErr } = React.useMemo(() => {
    const t0 = performance.now();
    const out = buildRegex(pattern, flagsStr);
    setRunMs(performance.now() - t0);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, flagsStr, testText, replace]);

  React.useEffect(() => {
    setError(buildErr);
  }, [buildErr]);

  function useInTester(item: Pattern) {
    setPattern(item.pattern);
    const next: typeof flags = { g: false, i: false, m: false, s: false, u: false, y: false };
    (item.flags ?? '').split('').forEach((f) => {
      if (f in next) (next as any)[f] = true;
    });
    setFlags(next);
    setTestText(item.sample ?? '');
    safeWindow()?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success('Copied Successfully!');
    setTimeout(() => setCopied(null), 900);
  }

  function resetTester() {
    setPattern('');
    setFlags({ g: true, i: false, m: false, s: false, u: false, y: false });
    setTestText('');
    setReplace('');
    setError(null);
  }

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LIBRARY.filter((p) => {
      if (cat !== 'All' && p.category !== cat) return false;
      if (!needle) return true;
      return p.title.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle) || p.pattern.toLowerCase().includes(needle);
    });
  }, [q, cat]);

  const matches = React.useMemo(() => collectMatches(testText, re), [testText, re]);

  const replaced = React.useMemo(() => {
    if (!re || !testText) return '';
    try {
      const gg = re.global ? re : new RegExp(re.source, re.flags + 'g');
      return testText.replace(gg, replace);
    } catch {
      return '';
    }
  }, [re, testText, replace]);

  function shareLink() {
    const w = safeWindow();
    if (!w) return;
    const url = w.location.origin + w.location.pathname + encodeShare({ pattern, flags: flagsStr, text: testText, replace });
    copy(url);
  }

  function addFavorite() {
    const title = prompt('Save as (title)?', pattern.slice(0, 32) || 'Untitled');
    if (!title) return;
    const id = `${Date.now()}`;
    const next = [...favs, { id, title, pattern, flags: flagsStr }];
    saveFavs(next);
  }
  function applyFavorite(f: Fav) {
    setPattern(f.pattern);
    const next: any = { g: false, i: false, m: false, s: false, u: false, y: false };
    for (const ch of f.flags) if (ch in next) next[ch] = true;
    setFlags(next);
  }
  function removeFavorite(id: string) {
    const next = favs.filter((f) => f.id !== id);
    saveFavs(next);
  }

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div className="md:w-1/2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <RegexIcon className="h-6 w-6" /> Regex Library
          </h1>
          <p className="text-sm text-muted-foreground">Curated expressions with a built-in tester. Copy, tweak flags, replace, and validate against your text.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetTester} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset Tester
          </Button>
          <Button
            onClick={() =>
              navigator.clipboard
                .readText()
                .then((t) => t && setTestText(t))
                .catch(() => {})
            }
            className="gap-2">
            <ClipboardPaste className="h-4 w-4" /> Paste Text
          </Button>
          <Button variant="outline" onClick={shareLink} className="gap-2">
            <LinkIcon className="h-4 w-4" /> Share
          </Button>
          <Button variant="outline" onClick={addFavorite} className="gap-2">
            <Save className="h-4 w-4" /> Save Fav
          </Button>
        </div>
      </GlassCard>

      {/* Tester */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Regex Tester</CardTitle>
          <CardDescription>Edit the pattern, toggle flags, and see live matches highlighted.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">/</span>
                <Input id="pattern" placeholder="your-regex-here" value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono" />
                <span className="rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">/</span>
                <Input
                  aria-label="flags"
                  value={flagsStr}
                  onChange={(e) => {
                    const next: any = { g: false, i: false, m: false, s: false, u: false, y: false };
                    const v = e.target.value.replace(/[^gimsuy]/g, '');
                    for (const ch of v) if (ch in next) next[ch] = true;
                    setFlags(next);
                  }}
                  className="w-24 font-mono"
                />
                <span className="ml-auto text-xs text-muted-foreground">{runMs ? `${runMs.toFixed(2)}ms` : '—'}</span>
              </div>
              <div className="mt-1 grid grid-cols-6 gap-2 sm:grid-cols-6">
                {(['g', 'i', 'm', 's', 'u', 'y'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFlags((f) => ({ ...f, [k]: !f[k] }))}
                    className={`h-8 rounded-md border text-xs font-medium ${flags[k] ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    title={`Toggle ${k}`}>
                    {k}
                  </button>
                ))}
              </div>
              {error ? <p className="text-xs text-destructive">Error: {error}</p> : <p className="text-xs text-muted-foreground">Flags: {flagsStr || '—'}</p>}
            </div>

            <div className="space-y-2">
              <Label>Quick inserts</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK.map((qk) => (
                  <Button key={qk.label} size="sm" variant="outline" onClick={() => setPattern((p) => p + qk.value)}>
                    {qk.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test">Test Text</Label>
              <Textarea id="test" value={testText} onChange={(e) => setTestText(e.target.value)} className="min-h-[140px] font-mono" placeholder="Paste or type text to test…" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="replace">Replace</Label>
              <Input id="replace" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Use $1, $<name> etc." className="font-mono" />
              <p className="text-xs text-muted-foreground">
                Supports capture groups and named groups. Example: <code className="font-mono">Hello, $1</code> or <code className="font-mono">$&</code>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Preview (matches highlighted)</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(`/${pattern}/${flagsStr}`)} className="gap-2">
                  {copied === `/${pattern}/${flagsStr}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Regex
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadJson(matches, 'regex-matches.json')} className="gap-2">
                  <Download className="h-4 w-4" /> Matches JSON
                </Button>
              </div>
            </div>
            <div className="min-h-[140px] rounded-md border p-3 text-sm leading-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">{highlightMatches(testText, re)}</div>
            </div>

            {!error && re && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  source: <span className="font-mono ml-1">/{escapeForDisplay(re.source)}/</span>
                </Badge>
                <Badge variant="outline">flags: {re.flags || '—'}</Badge>
                <Badge variant="outline">matches: {matches.length}</Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label>Replace Result</Label>
              <Textarea readOnly value={replaced} className="min-h-[120px] font-mono" placeholder="Replaced text will appear here…" />
            </div>

            {/* Matches table-ish */}
            <div className="space-y-2">
              <Label>Matches Inspector</Label>
              <div className="max-h-64 overflow-auto rounded-md border">
                {matches.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No matches.</div>
                ) : (
                  <div className="divide-y">
                    {matches.map((m, i) => (
                      <div key={i} className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-12 sm:gap-3">
                        <div className="sm:col-span-3">
                          <div className="text-[11px] text-muted-foreground">Match #{i + 1}</div>
                          <div className="font-mono text-sm break-words">{m.match}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-[11px] text-muted-foreground">Index</div>
                          <div className="text-sm">{m.index}</div>
                        </div>
                        <div className="sm:col-span-7">
                          <div className="text-[11px] text-muted-foreground">Groups</div>
                          {m.groups ? (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(m.groups).map(([k, v]) => (
                                <Badge key={k} variant="secondary" className="font-mono">
                                  {k}: {v ?? '—'}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">—</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-6" />

      {/* Library controls */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div className="text-sm text-muted-foreground">Hand-picked patterns, ready to copy.</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patterns…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Category</Label>
            <select value={cat} onChange={(e) => setCat(e.target.value as any)} className="h-9 rounded-md border bg-background px-2 text-sm">
              {['All', 'Web', 'Numbers', 'Security', 'System', 'Text', 'Bangla'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Library grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <GlassCard key={item.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border bg-muted/50 p-2">
                <code className="whitespace-pre-wrap break-words text-sm">
                  /{escapeForDisplay(item.pattern)}/{item.flags || ''}
                </code>
              </div>
              {item.sample && (
                <div className="rounded-md border p-2">
                  <div className="mb-1 text-xs text-muted-foreground">Sample</div>
                  <div className="text-sm font-mono">{item.sample}</div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(`/${item.pattern}/${item.flags ?? ''}`)}>
                  {copied === `/${item.pattern}/${item.flags ?? ''}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
                <Button size="sm" className="gap-2" onClick={() => useInTester(item)}>
                  <Wand2 className="h-4 w-4" /> Use in Tester
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Favorites */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Favorites</CardTitle>
          <CardDescription>Save and reuse your most common patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          {favs.length === 0 ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              No favorites yet. Click <em>Save Fav</em> above to store the current pattern.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {favs.map((f) => (
                <div key={f.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">{f.title}</div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" onClick={() => applyFavorite(f)} title="Apply">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => copy(`/${f.pattern}/${f.flags}`)} title="Copy">
                        {copied === `/${f.pattern}/${f.flags}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => removeFavorite(f.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border bg-muted/50 p-2 text-sm font-mono">
                    /{escapeForDisplay(f.pattern)}/{f.flags}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </GlassCard>

      <Separator className="my-6" />

      {/* Cheatsheet */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Regex Cheatsheet</CardTitle>
          <CardDescription>Common tokens, anchors & quantifiers (JS flavor).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Anchors</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <code className="font-mono">^</code> start of string
              </li>
              <li>
                <code className="font-mono">$</code> end of string
              </li>
              <li>
                <code className="font-mono">\b</code> word boundary
              </li>
            </ul>
          </div>
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Character Classes</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <code className="font-mono">\d</code> digit, <code className="font-mono">\w</code> word, <code className="font-mono">\s</code> whitespace
              </li>
              <li>
                <code className="font-mono">.</code> any char (except newline unless <code className="font-mono">s</code>)
              </li>
              <li>
                <code className="font-mono">[abc]</code> set, <code className="font-mono">[^abc]</code> negated
              </li>
            </ul>
          </div>
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Groups & Quantifiers</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <code className="font-mono">( )</code> capture, <code className="font-mono">(?: )</code> non-capture
              </li>
              <li>
                <code className="font-mono">(?&lt;name&gt; )</code> named capture
              </li>
              <li>
                <code className="font-mono">?</code>, <code className="font-mono">*</code>, <code className="font-mono">+</code>, <code className="font-mono">{'{m,n}'}</code> (add{' '}
                <code className="font-mono">?</code> for lazy)
              </li>
            </ul>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}

function highlightMatches(text: string, re: RegExp | null) {
  if (!re || !text) return <>{text}</>;

  // Ensure global for iterative matching
  const g = re.global ? re : new RegExp(re.source, re.flags + 'g');

  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const m of text.matchAll(g)) {
    const start = m.index ?? 0;
    const end = start + (m[0]?.length ?? 0);

    if (start > last) {
      parts.push(<span key={`t-${last}`}>{text.slice(last, start)}</span>);
    }

    parts.push(
      <mark key={`m-${start}-${end}`} className="rounded px-0.5 py-0.5 ring-1 ring-primary/20">
        {text.slice(start, end)}
      </mark>,
    );

    last = end;

    if (m[0].length === 0) {
      // Avoid infinite loops on zero-width matches
      last += 1;
    }
  }

  if (last < text.length) {
    parts.push(<span key="t-end">{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}
