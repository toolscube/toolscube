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

import { Check, Copy, Download, History, ListChecks, ListOrdered, RotateCcw, Wand2 } from 'lucide-react';

// ---------- Helpers ----------
function csvDownload(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const c = cell ?? '';
          const needsQuote = /[",\n]/.test(c);
          const escaped = c.replace(/"/g, '""');
          return needsQuote ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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

const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

type CaseMode = 'none' | 'lower' | 'upper' | 'title';
type SortMode = 'none' | 'asc' | 'desc';

export default function TextToListPage() {
  // ---------- State ----------
  const [source, setSource] = React.useState('');
  const [trimItems, setTrimItems] = React.useState(true);
  const [collapseSpaces, setCollapseSpaces] = React.useState(true);
  const [removeEmpty, setRemoveEmpty] = React.useState(true);
  const [dedupe, setDedupe] = React.useState(true);
  const [sortMode, setSortMode] = React.useState<SortMode>('none');
  const [caseMode, setCaseMode] = React.useState<CaseMode>('none');
  const [prefix, setPrefix] = React.useState('');
  const [suffix, setSuffix] = React.useState('');
  const [numbering, setNumbering] = React.useState(false);
  const [numStart, setNumStart] = React.useState<number>(1);
  const [numPad, setNumPad] = React.useState<number>(0);
  const [numSep, setNumSep] = React.useState('. ');
  const [copiedKind, setCopiedKind] = React.useState<'list' | 'csv' | 'joined' | null>(null);

  // ---------- Processing ----------
  const processed = React.useMemo(() => {
    // Split by common separators: newline, comma, semicolon, pipe, tab
    const parts = source
      .split(/[\n,;|\t]+/g)
      .map((s) => (collapseSpaces ? s.replace(/\s+/g, ' ') : s))
      .map((s) => (trimItems ? s.trim() : s));

    let items = removeEmpty ? parts.filter((s) => s.length > 0) : parts.slice();

    // Case transform (before dedupe/sort to make behavior predictable)
    if (caseMode !== 'none') {
      items = items.map((s) => (caseMode === 'upper' ? s.toUpperCase() : caseMode === 'lower' ? s.toLowerCase() : titleCase(s)));
    }

    // Dedupe
    if (dedupe) {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const it of items) {
        if (!seen.has(it)) {
          seen.add(it);
          out.push(it);
        }
      }
      items = out;
    }

    // Sort
    if (sortMode !== 'none') {
      items = [...items].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      if (sortMode === 'desc') items.reverse();
    }

    // Prefix / Suffix
    if (prefix || suffix) {
      items = items.map((s) => `${prefix}${s}${suffix}`);
    }

    // Numbering
    if (numbering) {
      items = items.map((s, i) => {
        const n = (numStart + i).toString();
        const padded = numPad > 0 ? n.padStart(numPad, '0') : n;
        return `${padded}${numSep}${s}`;
      });
    }

    return items;
  }, [source, trimItems, collapseSpaces, removeEmpty, dedupe, sortMode, caseMode, prefix, suffix, numbering, numStart, numPad, numSep]);

  const stats = React.useMemo(() => {
    // Stats are based on the “cleaned but un-numbered/un-prefixed” baseline
    const baseline = source
      .split(/[\n,;|\t]+/g)
      .map((s) => (collapseSpaces ? s.replace(/\s+/g, ' ') : s))
      .map((s) => (trimItems ? s.trim() : s));

    const afterEmpty = removeEmpty ? baseline.filter(Boolean) : baseline.slice();

    const cased = caseMode === 'none' ? afterEmpty : afterEmpty.map((s) => (caseMode === 'upper' ? s.toUpperCase() : caseMode === 'lower' ? s.toLowerCase() : titleCase(s)));

    const uniqueCount = (arr: string[]) => new Set(arr).size;

    return {
      inputCount: baseline.length,
      nonEmptyCount: afterEmpty.length,
      uniqueCount: uniqueCount(cased),
      outputCount: processed.length,
    };
  }, [source, collapseSpaces, trimItems, removeEmpty, caseMode, processed]);

  // ---------- Actions ----------
  function resetAll() {
    setSource('');
    setTrimItems(true);
    setCollapseSpaces(true);
    setRemoveEmpty(true);
    setDedupe(true);
    setSortMode('none');
    setCaseMode('none');
    setPrefix('');
    setSuffix('');
    setNumbering(false);
    setNumStart(1);
    setNumPad(0);
    setNumSep('. ');
    setCopiedKind(null);
  }

  async function copyList() {
    await navigator.clipboard.writeText(processed.join('\n'));
    setCopiedKind('list');
    setTimeout(() => setCopiedKind(null), 1200);
  }

  async function copyJoined() {
    await navigator.clipboard.writeText(processed.join(', '));
    setCopiedKind('joined');
    setTimeout(() => setCopiedKind(null), 1200);
  }

  function exportCSV() {
    const rows = processed.map((s) => [s]); // single column CSV
    csvDownload('clean-list.csv', [['Item'], ...rows]);
  }

  function exportTXT() {
    downloadTxt('clean-list.txt', processed.join('\n'));
  }

  // ---------- UI ----------
  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ListChecks className="h-6 w-6" /> Text to List
          </h1>
          <p className="text-sm text-muted-foreground">Split by comma/newline → clean list with trim, dedupe, sort, case, prefix/suffix & numbering.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={copyList} variant="outline" className="gap-2">
            {copiedKind === 'list' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy List
          </Button>
          <Button onClick={copyJoined} variant="outline" className="gap-2">
            {copiedKind === 'joined' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Joined
          </Button>
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button onClick={exportTXT} className="gap-2">
            <Download className="h-4 w-4" /> TXT
          </Button>
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Input Text</CardTitle>
          <CardDescription>Paste or type values separated by commas and/or new lines.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. apple, banana
orange
grape,  mango

pear"
            className="min-h-[180px] font-mono"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="font-normal">
              Auto split: comma / newline / ; / | / tab
            </Badge>
            <div className="flex items-center gap-1">
              <History className="h-3.5 w-3.5" /> {stats.inputCount} segments found
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Clean and format your list exactly how you want.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Trim items</Label>
                <p className="text-xs text-muted-foreground">Remove leading/trailing whitespace.</p>
              </div>
              <Switch checked={trimItems} onCheckedChange={setTrimItems} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Collapse spaces</Label>
                <p className="text-xs text-muted-foreground">Convert multiple spaces/tabs to single space.</p>
              </div>
              <Switch checked={collapseSpaces} onCheckedChange={setCollapseSpaces} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Remove empty</Label>
                <p className="text-xs text-muted-foreground">Drop blank lines or empty segments.</p>
              </div>
              <Switch checked={removeEmpty} onCheckedChange={setRemoveEmpty} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dedupe</Label>
                <p className="text-xs text-muted-foreground">Keep the first occurrence only.</p>
              </div>
              <Switch checked={dedupe} onCheckedChange={setDedupe} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Sort</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Button type="button" variant={sortMode === 'none' ? 'default' : 'outline'} onClick={() => setSortMode('none')} className="w-full">
                  None
                </Button>
                <Button type="button" variant={sortMode === 'asc' ? 'default' : 'outline'} onClick={() => setSortMode('asc')} className="w-full">
                  A→Z
                </Button>
                <Button type="button" variant={sortMode === 'desc' ? 'default' : 'outline'} onClick={() => setSortMode('desc')} className="w-full">
                  Z→A
                </Button>
              </div>
            </div>

            <div>
              <Label>Case</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {(['none', 'lower', 'upper', 'title'] as const).map((m) => (
                  <Button key={m} type="button" variant={caseMode === m ? 'default' : 'outline'} onClick={() => setCaseMode(m)} className="w-full capitalize">
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prefix">Prefix</Label>
                <Input id="prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. - " />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="suffix">Suffix</Label>
                <Input id="suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. ;" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" /> Numbering
                </Label>
                <p className="text-xs text-muted-foreground">Add incremental numbers to each item.</p>
              </div>
              <Switch checked={numbering} onCheckedChange={setNumbering} />
            </div>

            {numbering && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="numStart">Start</Label>
                  <Input id="numStart" type="number" min={-999999} max={999999} value={numStart} onChange={(e) => setNumStart(Number(e.target.value) || 1)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="numPad">Pad</Label>
                  <Input id="numPad" type="number" min={0} max={8} value={numPad} onChange={(e) => setNumPad(Math.max(0, Math.min(8, Number(e.target.value) || 0)))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="numSep">Separator</Label>
                  <Input id="numSep" value={numSep} onChange={(e) => setNumSep(e.target.value)} placeholder=". " />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Output */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Result</CardTitle>
          <CardDescription>Clean list preview and exports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="gap-1">
                <Wand2 className="h-3.5 w-3.5" /> Output: {stats.outputCount}
              </Badge>
              <Badge variant="outline">Input Segments: {stats.inputCount}</Badge>
              <Badge variant="outline">Non-empty: {stats.nonEmptyCount}</Badge>
              <Badge variant="outline">Unique: {stats.uniqueCount}</Badge>
            </div>
            <Textarea readOnly className="min-h-[200px] font-mono" value={processed.join('\n')} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={copyList}>
                {copiedKind === 'list' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy (newline)
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={copyJoined}>
                {copiedKind === 'joined' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy (comma)
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button size="sm" className="gap-2" onClick={exportTXT}>
                <Download className="h-4 w-4" /> TXT
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Preview List</Label>
                <p className="text-xs text-muted-foreground">A quick visual of each cleaned item.</p>
              </div>
              <Badge variant="secondary">{processed.length} items</Badge>
            </div>
            <div className="rounded-md border p-3">
              {processed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items yet. Paste text on the left to begin.</p>
              ) : (
                <ul className="list-disc pl-6 text-sm space-y-1">
                  {processed.map((it, i) => (
                    <li key={`${i}-${it.slice(0, 32)}`}>{it}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
