'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Check, ClipboardCopy, ClipboardPaste, ClipboardType, Download, Eraser, RotateCcw, Upload, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ---------- Types ----------

type CleanOptions = {
  trim: boolean;
  collapseSpaces: boolean;
  stripLineBreaks: boolean; // if true -> flatten to single spaces
  stripExtraBlankLines: boolean; // if false -> keep single \n
  normalizeQuotes: boolean;
  normalizeDashes: boolean;
  replaceEllipsis: boolean;
  tabsToSpaces: boolean;
  removeZeroWidth: boolean;
  removeUrls: boolean;
  removeEmojis: boolean;

  caseMode: 'none' | 'lower' | 'upper' | 'title' | 'sentence';
  autoCleanOnPaste: boolean;
};

type HistoryItem = { id: string; ts: number; src: string; out: string };

// ---------- Helpers ----------

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function toTitleCase(s: string) {
  return s.replace(/[\w\p{L}][^\s-]*/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toSentenceCase(s: string) {
  // naive sentence case: capitalize first letter after . ! ? or start
  return s.toLowerCase().replace(/(^\s*[a-z\p{Ll}]|[.!?]\s*[a-z\p{Ll}])/gu, (m) => m.toUpperCase());
}

function stripUrls(s: string) {
  const urlRe = /(https?:\/\/|www\.)[^\s]+/gi;
  return s.replace(urlRe, '');
}

function stripEmojis(s: string) {
  try {
    // Modern engines: Extended_Pictographic
    return s.replace(/\p{Extended_Pictographic}/gu, '');
  } catch {
    // Fallback rough range
    return s.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

function normalizeSmartChars(s: string, opts: Pick<CleanOptions, 'normalizeQuotes' | 'normalizeDashes' | 'replaceEllipsis'>) {
  let r = s;
  if (opts.normalizeQuotes) {
    r = r
      .replace(/[\u2018\u2019\u2032]/g, "'")
      .replace(/[\u201C\u201D\u2033]/g, '"')
      .replace(/\u00AB|\u00BB/g, '"');
  }
  if (opts.normalizeDashes) {
    r = r.replace(/[\u2013\u2014]/g, '-');
  }
  if (opts.replaceEllipsis) {
    r = r.replace(/\u2026/g, '...');
  }
  return r;
}

function cleanText(input: string, opts: CleanOptions) {
  let s = input;

  // normalize NBSP & tabs
  s = s.replace(/\u00A0/g, ' ');
  if (opts.tabsToSpaces) s = s.replace(/\t/g, ' ');

  // normalize smart punctuation
  s = normalizeSmartChars(s, opts);

  // remove zero-width
  if (opts.removeZeroWidth) s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // remove URLs
  if (opts.removeUrls) s = stripUrls(s);

  // remove emojis
  if (opts.removeEmojis) s = stripEmojis(s);

  // line-handling
  if (opts.stripLineBreaks) {
    s = s.replace(/[\r\n]+/g, ' ');
  } else if (opts.stripExtraBlankLines) {
    s = s.replace(/\n{3,}/g, '\n\n');
  }

  // spaces
  if (opts.collapseSpaces) s = s.replace(/[ \t]{2,}/g, ' ');
  if (opts.trim) s = s.trim();

  // case
  switch (opts.caseMode) {
    case 'lower':
      s = s.toLowerCase();
      break;
    case 'upper':
      s = s.toUpperCase();
      break;
    case 'title':
      s = toTitleCase(s);
      break;
    case 'sentence':
      s = toSentenceCase(s);
      break;
  }

  return s;
}

function download(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const DEFAULT_OPTS: CleanOptions = {
  trim: true,
  collapseSpaces: true,
  stripLineBreaks: false,
  stripExtraBlankLines: true,
  normalizeQuotes: true,
  normalizeDashes: true,
  replaceEllipsis: true,
  tabsToSpaces: true,
  removeZeroWidth: true,
  removeUrls: false,
  removeEmojis: false,
  caseMode: 'none',
  autoCleanOnPaste: true,
};

// ---------- Page ----------

export default function ClipboardCleanerPage() {
  const [raw, setRaw] = useState('');
  const [opts, setOpts] = useState<CleanOptions>(DEFAULT_OPTS);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const rawRef = useRef<HTMLTextAreaElement | null>(null);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem('tools:clipclean:opts');
      if (s) setOpts({ ...DEFAULT_OPTS, ...(JSON.parse(s) as CleanOptions) });
      const h = localStorage.getItem('tools:clipclean:history');
      if (h) setHistory(JSON.parse(h));
      const r = localStorage.getItem('tools:clipclean:raw');
      if (r) setRaw(r);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tools:clipclean:opts', JSON.stringify(opts));
    } catch {}
  }, [opts]);
  useEffect(() => {
    try {
      localStorage.setItem('tools:clipclean:history', JSON.stringify(history.slice(0, 20)));
    } catch {}
  }, [history]);
  useEffect(() => {
    try {
      localStorage.setItem('tools:clipclean:raw', raw);
    } catch {}
  }, [raw]);

  const cleaned = useMemo(() => cleanText(raw, opts), [raw, opts]);

  const paste = async () => {
    try {
      if (!navigator.clipboard?.readText) throw new Error('CLIP');
      const t = await navigator.clipboard.readText();
      setRaw(opts.autoCleanOnPaste ? cleanText(t, opts) : t);
    } catch {
      // Fallback: focus textarea and let user Ctrl+V
      rawRef.current?.focus();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      pushHistory(raw, cleaned);
    } catch {}
  };

  const pushHistory = (src: string, out: string) => {
    if (!out.trim()) return;
    setHistory((h) => [{ id: uid('h'), ts: Date.now(), src, out }, ...h].slice(0, 20));
  };

  const onCleanClick = () => {
    // If user wants explicit clean action, also push to history
    pushHistory(raw, cleaned);
  };

  const resetAll = () => {
    setRaw('');
    setOpts(DEFAULT_OPTS);
  };

  const importFile = async (f: File) => {
    const txt = await f.text();
    setRaw(txt);
  };

  const exportTxt = () => download('cleaned.txt', cleaned, 'text/plain');

  // stats
  const stats = useMemo(() => {
    const chars = cleaned.length;
    const words = cleaned.trim() ? cleaned.trim().split(/\s+/).length : 0;
    const lines = cleaned ? cleaned.split(/\r?\n/).length : 0;
    return { chars, words, lines };
  }, [cleaned]);

  return (
    <div className="space-y-4">
      <MotionGlassCard>
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ClipboardType className="h-6 w-6" /> Clipboard Cleaner
            </h1>
            <p className="text-sm text-muted-foreground">Strip formatting and paste as plain text. Clean punctuation, spaces, emojis & more.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={paste} className="gap-2">
              <ClipboardPaste className="h-4 w-4" /> Paste
            </Button>
            <Button variant="outline" onClick={onCleanClick} className="gap-2">
              <Wand2 className="h-4 w-4" /> Clean
            </Button>
            <Button onClick={copy} className="gap-2">
              <ClipboardCopy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Choose how text should be cleaned.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Case</Label>
              <Select value={opts.caseMode} onValueChange={(v: CleanOptions['caseMode']) => setOpts({ ...opts, caseMode: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No change</SelectItem>
                  <SelectItem value="lower">lowercase</SelectItem>
                  <SelectItem value="upper">UPPERCASE</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                  <SelectItem value="sentence">Sentence case</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Whitespace</Label>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <Switch checked={opts.trim} onCheckedChange={(v) => setOpts({ ...opts, trim: v })} /> Trim ends
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.collapseSpaces} onCheckedChange={(v) => setOpts({ ...opts, collapseSpaces: v })} /> Collapse multiple spaces
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.tabsToSpaces} onCheckedChange={(v) => setOpts({ ...opts, tabsToSpaces: v })} /> Tabs → spaces
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.stripLineBreaks} onCheckedChange={(v) => setOpts({ ...opts, stripLineBreaks: v })} /> Flatten line breaks
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.stripExtraBlankLines} onCheckedChange={(v) => setOpts({ ...opts, stripExtraBlankLines: v })} /> Keep max 1 blank line
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Characters</Label>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <Switch checked={opts.normalizeQuotes} onCheckedChange={(v) => setOpts({ ...opts, normalizeQuotes: v })} /> Smart quotes → ' "
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.normalizeDashes} onCheckedChange={(v) => setOpts({ ...opts, normalizeDashes: v })} /> En/Em dashes → -
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.replaceEllipsis} onCheckedChange={(v) => setOpts({ ...opts, replaceEllipsis: v })} /> Ellipsis … → ...
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.removeZeroWidth} onCheckedChange={(v) => setOpts({ ...opts, removeZeroWidth: v })} /> Remove zero‑width chars
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.removeEmojis} onCheckedChange={(v) => setOpts({ ...opts, removeEmojis: v })} /> Remove emojis
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={opts.removeUrls} onCheckedChange={(v) => setOpts({ ...opts, removeUrls: v })} /> Remove URLs
                </label>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>Behavior</Label>
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={opts.autoCleanOnPaste} onCheckedChange={(v) => setOpts({ ...opts, autoCleanOnPaste: v })} /> Auto‑clean on paste
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Editors */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Editor</CardTitle>
            <CardDescription>Paste on the left, get clean text on the right.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Original</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="text/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) importFile(f);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                  />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Load file
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setRaw('')}>
                    <Eraser className="h-4 w-4" /> Clear
                  </Button>
                </div>
              </div>
              <Textarea
                ref={rawRef}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onPaste={(e) => {
                  if (!opts.autoCleanOnPaste) return;
                  const pasted = e.clipboardData.getData('text');
                  if (pasted) {
                    e.preventDefault();
                    const out = cleanText(pasted, opts);
                    const selStart = (e.target as HTMLTextAreaElement).selectionStart || 0;
                    const selEnd = (e.target as HTMLTextAreaElement).selectionEnd || 0;
                    setRaw((prev) => prev.slice(0, selStart) + out + prev.slice(selEnd));
                  }
                }}
                placeholder="Paste here (Ctrl/Cmd + V)…"
                className="min-h-[220px] font-mono"
              />
              <div className="text-xs text-muted-foreground">Tip: Use the Paste button for one‑click clipboard import.</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cleaned</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={exportTxt}>
                    <Download className="h-4 w-4" /> .txt
                  </Button>
                  <Button size="sm" className="gap-2" onClick={copy}>
                    <ClipboardCopy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <Textarea readOnly value={cleaned} className="min-h-[220px] font-mono" />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{stats.words} words</Badge>
                <Badge variant="secondary">{stats.chars} chars</Badge>
                <Badge variant="secondary">{stats.lines} lines</Badge>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* History */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
            <CardDescription>Last 20 results (local only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 && <p className="text-sm text-muted-foreground">No history yet. Clean something to see it here.</p>}
            <div className="grid gap-3 md:grid-cols-2">
              {history.map((h) => (
                <div key={h.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(h.ts).toLocaleString()}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 gap-1"
                      onClick={async () => {
                        await navigator.clipboard.writeText(h.out);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />} Copy
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">Source</div>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words bg-muted/30 rounded p-2 max-h-32">{h.src}</pre>
                  <div className="text-xs text-muted-foreground">Cleaned</div>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words bg-muted/30 rounded p-2 max-h-32">{h.out}</pre>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
