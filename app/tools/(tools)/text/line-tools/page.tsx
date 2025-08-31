'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Eraser, Filter, Hash, List, ListOrdered, Replace, RotateCcw, Scissors, Search, Shuffle, SortAsc, SortDesc, Upload } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

// Utilities
const LS_KEY = 'line-tools-content-v1';

function normalizeEOL(s: string) {
  return s.replace(/\r\n?/g, '\n');
}

function splitLines(s: string) {
  if (!s) return [] as string[];
  return normalizeEOL(s).split('\n');
}

function joinLines(lines: string[]) {
  return lines.join('\n');
}

function downloadFile(name: string, content: string, type = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LineToolsPage() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [keepOrder, setKeepOrder] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [trimEach, setTrimEach] = useState(true);

  // Find & Replace
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  // Filter
  const [filterQuery, setFilterQuery] = useState('');
  const [filterRegex, setFilterRegex] = useState(false);
  const [filterMode, setFilterMode] = useState<'keep' | 'remove'>('keep');

  // Prefix/Suffix/Numbering
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [numbering, setNumbering] = useState(false);
  const [startNum, setStartNum] = useState(1);
  const [numSep, setNumSep] = useState('. ');

  const fileRef = useRef<HTMLInputElement>(null);

  // Persist input
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setText(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, text);
    } catch {}
  }, [text]);

  const lines = useMemo(() => {
    let l = splitLines(text);
    if (trimEach) l = l.map((x) => x.trim());
    if (removeEmpty) l = l.filter((x) => x.length > 0);
    return l;
  }, [text, trimEach, removeEmpty]);

  const stats = useMemo(() => {
    const total = splitLines(text).length;
    const empty = splitLines(text).filter((x) => x.trim() === '').length;
    const uniqSet = new Set(lines.map((x) => (caseSensitive ? x : x.toLowerCase())));
    const avgLen = lines.length ? Math.round(lines.join('').length / lines.length) : 0;
    return { total, nonEmpty: total - empty, empty, unique: uniqSet.size, avgLen };
  }, [text, lines, caseSensitive]);

  function applyOutput(l: string[]) {
    // Prefix / suffix / numbering applied last
    const withAffixes = l.map((line, i) => {
      const n = numbering ? `${startNum + i}${numSep}` : '';
      return `${n}${prefix}${line}${suffix}`;
    });
    const out = joinLines(withAffixes);
    setOutput(out);
    return out;
  }

  // Actions
  function actionSort(dir: 'asc' | 'desc') {
    const key = (s: string) => (caseSensitive ? s : s.toLowerCase());
    const sorted = [...lines].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    if (dir === 'desc') sorted.reverse();
    applyOutput(sorted);
  }

  function actionShuffle() {
    const arr = [...lines];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    applyOutput(arr);
  }

  function actionUnique() {
    const seen = new Set<string>();
    const arr: string[] = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        arr.push(line);
      }
    }
    if (!keepOrder) arr.sort((a, b) => a.localeCompare(b));
    applyOutput(arr);
  }

  function actionTrim() {
    const l = splitLines(text).map((x) => x.trim());
    applyOutput(l);
  }

  function actionFindReplace() {
    const src = splitLines(text);
    let pattern: RegExp | null = null;
    if (useRegex) {
      try {
        pattern = new RegExp(find, caseSensitive ? 'g' : 'gi');
      } catch {
        // invalid regex → do nothing
        return;
      }
    }
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = pattern || new RegExp(wholeWord ? `\\b${esc(find)}\\b` : esc(find), caseSensitive ? 'g' : 'gi');
    const out = src.map((line) => line.replace(re, replace));
    applyOutput(out);
  }

  function actionFilter() {
    const src = [...lines];
    let re: RegExp | null = null;
    if (filterRegex) {
      try {
        re = new RegExp(filterQuery, caseSensitive ? '' : 'i');
      } catch {
        return;
      }
    }
    const contains = (s: string) => (re ? re.test(s) : caseSensitive ? s.includes(filterQuery) : s.toLowerCase().includes(filterQuery.toLowerCase()));

    const out = src.filter((l) => (filterMode === 'keep' ? contains(l) : !contains(l)));
    applyOutput(out);
  }

  function actionPrefixSuffixOnly() {
    applyOutput([...lines]);
  }

  function resetAll() {
    setText('');
    setOutput('');
    setKeepOrder(true);
    setCaseSensitive(false);
    setRemoveEmpty(true);
    setTrimEach(true);
    setFind('');
    setReplace('');
    setUseRegex(false);
    setWholeWord(false);
    setFilterQuery('');
    setFilterRegex(false);
    setFilterMode('keep');
    setPrefix('');
    setSuffix('');
    setNumbering(false);
    setStartNum(1);
    setNumSep('. ');
  }

  function copyOut() {
    const v = output || text;
    if (!v) return;
    navigator.clipboard.writeText(v);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(f);
    e.target.value = '';
  }

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <List className="h-6 w-6" /> Line Tools
          </h1>
          <p className="text-sm text-muted-foreground">Sort, dedupe, trim, find & replace, filter, shuffle, and format lines fast.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="text/plain,.txt,.csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" onClick={() => downloadFile('lines.txt', text)} className="gap-2" disabled={!text}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={copyOut} className="gap-2" disabled={!text && !output}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
          <CardDescription>Paste or type your lines below. We can trim and remove empty lines automatically.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea className="min-h-[220px] font-mono" placeholder={`orange\napple\nBanana\nbanana  \n  grape\n\npear`} value={text} onChange={(e) => setText(e.target.value)} />

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Trim each line</div>
                <div className="text-xs text-muted-foreground">Remove leading & trailing spaces.</div>
              </div>
              <Switch checked={trimEach} onCheckedChange={(v) => setTrimEach(Boolean(v))} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Remove empty lines</div>
                <div className="text-xs text-muted-foreground">Ignore blank lines in processing.</div>
              </div>
              <Switch checked={removeEmpty} onCheckedChange={(v) => setRemoveEmpty(Boolean(v))} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Case sensitive</div>
                <div className="text-xs text-muted-foreground">Affects sort & dedupe.</div>
              </div>
              <Switch checked={caseSensitive} onCheckedChange={(v) => setCaseSensitive(Boolean(v))} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Keep order on dedupe</div>
                <div className="text-xs text-muted-foreground">Preserve first occurrence.</div>
              </div>
              <Switch checked={keepOrder} onCheckedChange={(v) => setKeepOrder(Boolean(v))} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted-foreground">
            <div className="rounded-md border p-2">
              Total: <strong>{stats.total}</strong>
            </div>
            <div className="rounded-md border p-2">
              Non-empty: <strong>{stats.nonEmpty}</strong>
            </div>
            <div className="rounded-md border p-2">
              Empty: <strong>{stats.empty}</strong>
            </div>
            <div className="rounded-md border p-2">
              Unique: <strong>{stats.unique}</strong>
            </div>
            <div className="rounded-md border p-2">
              Avg length: <strong>{stats.avgLen}</strong>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Operations */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Operations</CardTitle>
          <CardDescription>Run one action at a time—output appears below. Prefix/suffix/numbering apply to every result.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => actionSort('asc')}>
              <SortAsc className="h-4 w-4" /> Sort A→Z
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => actionSort('desc')}>
              <SortDesc className="h-4 w-4" /> Sort Z→A
            </Button>
            <Button variant="outline" className="gap-2" onClick={actionShuffle}>
              <Shuffle className="h-4 w-4" /> Shuffle
            </Button>
            <Button variant="outline" className="gap-2" onClick={actionUnique}>
              <Hash className="h-4 w-4" /> Unique
            </Button>
            <Button variant="outline" className="gap-2" onClick={actionTrim}>
              <Scissors className="h-4 w-4" /> Trim lines
            </Button>
          </div>

          {/* Find & Replace */}
          <div className="rounded-md border">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <Replace className="h-4 w-4" /> Find & Replace
              </div>
            </div>
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Find</Label>
                <Input value={find} onChange={(e) => setFind(e.target.value)} placeholder={useRegex ? 'regex e.g. ^foo' : 'text'} />
              </div>
              <div className="space-y-2">
                <Label>Replace</Label>
                <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="with..." />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={useRegex} onCheckedChange={(v) => setUseRegex(Boolean(v))} /> <span className="text-sm">Regex</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={wholeWord} onCheckedChange={(v) => setWholeWord(Boolean(v))} disabled={useRegex} /> <span className="text-sm">Whole word</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" className="gap-2" onClick={actionFindReplace} disabled={!find}>
                  <Search className="h-4 w-4" /> Run Replace
                </Button>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="rounded-md border">
            <div className="px-3 py-2 border-b text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter lines
            </div>
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Query</Label>
                <Input value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} placeholder={filterRegex ? 'regex e.g. \\d{3}' : 'contains...'} />
              </div>
              <div className="grid grid-cols-2 gap-2 items-end">
                <div className="flex items-center gap-2">
                  <Switch checked={filterRegex} onCheckedChange={(v) => setFilterRegex(Boolean(v))} /> <span className="text-sm">Regex</span>
                </div>
                <Select value={filterMode} onValueChange={(v: 'keep' | 'remove') => setFilterMode(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Keep matches</SelectItem>
                    <SelectItem value="remove">Remove matches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button variant="outline" className="gap-2" onClick={actionFilter} disabled={!filterQuery}>
                  <Filter className="h-4 w-4" /> Apply Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Prefix/Suffix/Numbering */}
          <div className="rounded-md border">
            <div className="px-3 py-2 border-b text-sm font-medium flex items-center gap-2">
              <ListOrdered className="h-4 w-4" /> Prefix / Suffix / Numbering
            </div>
            <div className="p-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prefix</Label>
                <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. - " />
              </div>
              <div className="space-y-2">
                <Label>Suffix</Label>
                <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. ;" />
              </div>
              <div className="grid grid-cols-2 gap-2 items-end">
                <div className="flex items-center gap-2">
                  <Switch checked={numbering} onCheckedChange={(v) => setNumbering(Boolean(v))} /> <span className="text-sm">Enable numbering</span>
                </div>
                <Input type="number" value={startNum} onChange={(e) => setStartNum(Number(e.target.value) || 1)} disabled={!numbering} />
              </div>
              <div className="space-y-2">
                <Label>Number separator</Label>
                <Input value={numSep} onChange={(e) => setNumSep(e.target.value)} disabled={!numbering} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button variant="outline" className="gap-2" onClick={actionPrefixSuffixOnly}>
                  <ListOrdered className="h-4 w-4" /> Apply to Current
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Output */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Output</CardTitle>
          <CardDescription>Result of the last action. You can copy or download it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea className="min-h-[200px] font-mono" value={output} onChange={(e) => setOutput(e.target.value)} placeholder="Run an operation to see results here..." />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => downloadFile('lines-output.txt', output)} disabled={!output}>
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>
              <Copy className="h-4 w-4" /> Copy Output
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setText(output)} disabled={!output}>
              <Replace className="h-4 w-4" /> Replace Input
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setOutput('')} disabled={!output}>
              <Eraser className="h-4 w-4" /> Clear Output
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
