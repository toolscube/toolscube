'use client';

import SectionHeader from '@/components/root/section-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToolsHeader } from '@/components/ui/tools-header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AlignLeft, Braces, Check, ClipboardPaste, Copy, Download, Hash, Info, Link2, Minimize2, RotateCcw, Search, SortAsc, Trash2, Type, Upload, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function JsonFormatterPage() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoOnPaste, setAutoOnPaste] = useState<boolean>(true);

  // Tools tab state
  const [pathQuery, setPathQuery] = useState<string>('');
  const [pathResult, setPathResult] = useState<string>('');

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Persist input across sessions
  useEffect(() => {
    const saved = localStorage.getItem('tools:json-formatter:input');
    if (saved) setInput(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('tools:json-formatter:input', input);
  }, [input]);

  const stats = useMemo(() => {
    const lines = input.split(/\n/).length;
    const chars = input.length;
    return { lines, chars };
  }, [input]);

  // --- Helpers ---
  function parseSafe(text: string) {
    return JSON.parse(text);
  }

  function sortObjectDeep<T>(value: T): T {
    if (Array.isArray(value)) return value.map(sortObjectDeep) as unknown as T;
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      entries.sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
      const sorted: Record<string, unknown> = {};
      for (const [k, v] of entries) sorted[k] = sortObjectDeep(v);
      return sorted as unknown as T;
    }
    return value;
  }

  function getIndentValue() {
    return indent === 'tab' ? '\t' : Number(indent);
  }

  // Lightweight object path reader: user enters e.g. meta.site or products[0].title
  function readByPath(root: any, path: string) {
    if (!path.trim()) return root;
    // Tokenize dot/bracket paths: foo.bar[0].baz
    const tokens: (string | number)[] = [];
    path.replace(/\[(.*?)\]|[^.\[\]]+/g, (m, g1) => {
      if (m.startsWith('[')) {
        const key = g1?.trim()?.replace(/^['\"]|['\"]$/g, '');
        const n = Number(key);
        tokens.push(Number.isFinite(n) && String(n) === key ? n : key ?? '');
      } else {
        tokens.push(m);
      }
      return '';
    });
    let cur = root;
    for (const t of tokens) {
      if (cur == null) return undefined;
      cur = cur[t as any];
    }
    return cur;
  }

  // --- Actions ---
  function prettify() {
    try {
      const json = parseSafe(input);
      const value = sortKeys ? sortObjectDeep(json) : json;
      const pretty = JSON.stringify(value, null, getIndentValue());
      setOutput(pretty);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      setOutput('');
    }
  }

  function minify() {
    try {
      const json = parseSafe(input);
      const value = sortKeys ? sortObjectDeep(json) : json;
      const compact = JSON.stringify(value);
      setOutput(compact);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      setOutput('');
    }
  }

  function validate() {
    try {
      parseSafe(input);
      setError('');
      setOutput('✅ Valid JSON');
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      setOutput('');
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (!autoOnPaste) return;
    const text = e.clipboardData.getData('text');
    if (!text) return;
    try {
      const json = parseSafe(text);
      const pretty = JSON.stringify(json, null, getIndentValue());
      e.preventDefault();
      setInput(pretty);
      setError('');
      setOutput('');
    } catch {
      // leave default paste if not JSON
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function pasteIn() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {}
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError('');
    setPathResult('');
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || ''));
    reader.readAsText(file);
    e.currentTarget.value = '';
  }

  function download(text: string, name = 'data.json') {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // --- Utilities ---
  function toTypescript() {
    try {
      const json = parseSafe(input);
      const out = jsonToTs('Root', json);
      setOutput(out);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      setOutput('');
    }
  }

  function doPathQuery() {
    try {
      const json = parseSafe(input);
      const val = readByPath(json, pathQuery);
      setPathResult(JSON.stringify(val, null, getIndentValue()));
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      setPathResult('');
    }
  }

  function b64Encode() {
    try {
      const buff = typeof window === 'undefined' ? Buffer.from(input) : new TextEncoder().encode(input);
      const b64 = typeof window === 'undefined' ? (buff as any).toString('base64') : btoa(String.fromCharCode(...buff));
      setOutput(b64);
      setError('');
    } catch (e: any) {
      setError('Base64 encode failed');
    }
  }
  function b64Decode() {
    try {
      const str = typeof window === 'undefined' ? Buffer.from(input, 'base64').toString('utf-8') : new TextDecoder().decode(Uint8Array.from(atob(input), (c) => c.charCodeAt(0)));
      setOutput(str);
      setError('');
    } catch (e: any) {
      setError('Base64 decode failed');
    }
  }

  function urlEncode() {
    setOutput(encodeURIComponent(input));
    setError('');
  }
  function urlDecode() {
    try {
      setOutput(decodeURIComponent(input));
      setError('');
    } catch {
      setError('URL decode failed');
    }
  }
  function escapeStr() {
    setOutput(input.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\"/g, '\\"'));
    setError('');
  }
  function unescapeStr() {
    setOutput(input.replace(/\\n/g, '\n').replace(/\\\"/g, '"').replace(/\\\\/g, '\\'));
    setError('');
  }

  // --- Render ---
  return (
    <TooltipProvider>
      <div className="pb-4">
        <ToolsHeader breadcrumbItems={[{ label: 'Tools', href: '/tools' }, { label: 'Developer', href: '/tools/#cat-Developer' }, { label: 'JSON Formatter' }]} />

        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader title="JSON Formatter" desc="Pretty, minify, validate, sort keys, JSONPath, TypeScript, Base64/URL tools." />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="outline">Lines: {stats.lines}</Badge>
              <Badge variant="outline">Chars: {stats.chars}</Badge>
            </div>
            <Button variant="outline" onClick={clearAll} className="gap-2">
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>

        {/* Options Bar */}
        <MotionGlassCard className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <div className="flex items-center justify-between gap-3 md:justify-start">
                <Label htmlFor="indent" className="whitespace-nowrap">
                  Indent
                </Label>
                <Select value={indent} onValueChange={(v: any) => setIndent(v)}>
                  <SelectTrigger id="indent" className="w-[160px]">
                    <SelectValue placeholder="Indent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="tab">Tabs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-start">
                <Label htmlFor="sortKeys" className="whitespace-nowrap">
                  Sort keys
                </Label>
                <div className="flex items-center gap-2">
                  <Switch id="sortKeys" checked={sortKeys} onCheckedChange={setSortKeys} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sort object keys alphabetically (deep). Arrays are preserved.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-start">
                <Label htmlFor="autoPaste" className="whitespace-nowrap">
                  Auto-format on paste
                </Label>
                <Switch id="autoPaste" checked={autoOnPaste} onCheckedChange={setAutoOnPaste} />
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-start">
                <input ref={fileRef} type="file" accept="application/json,.json,.txt" className="hidden" onChange={handleFile} />
                <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full gap-2">
                  <Upload className="h-4 w-4" /> Import JSON
                </Button>
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-start">
                <Button variant="outline" onClick={() => download(output || input || '{}', 'data.json')} className="w-full gap-2">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          </CardContent>
        </MotionGlassCard>

        {/* Workbench */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input */}
          <MotionGlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Input</span>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={pasteIn}>
                        <ClipboardPaste className="h-4 w-4" /> Paste
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paste from clipboard</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setInput('')}>
                        <Trash2 className="h-4 w-4" /> Clear
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear input</TooltipContent>
                  </Tooltip>
                </div>
              </CardTitle>
              <CardDescription>Paste or type your JSON on the left. Use the toolbar to format or validate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                ref={inputRef}
                value={input}
                onPaste={handlePaste}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"hello":"world"}'
                className={cn('min-h-[360px] font-mono', error && 'border-destructive')}
              />
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Invalid JSON</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap break-words">{error}</AlertDescription>
                </Alert>
              ) : (
                <p className="text-xs text-muted-foreground">Tip: Strict JSON (no comments/trailing commas). Enable auto-format on paste above.</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button data-prettify onClick={prettify} className="gap-2">
                <Wand2 className="h-4 w-4" /> Prettify
              </Button>
              <Button data-minify variant="secondary" onClick={minify} className="gap-2">
                <Minimize2 className="h-4 w-4" /> Minify
              </Button>
              <Button variant="outline" onClick={validate} className="gap-2">
                <AlignLeft className="h-4 w-4" /> Validate
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setOutput('');
                  setError('');
                  setInput(example);
                }}
                className="ml-auto gap-2">
                <RotateCcw className="h-4 w-4" /> Load example
              </Button>
            </CardFooter>
          </MotionGlassCard>

          {/* Output */}
          <MotionGlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Output</span>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSortKeys((v) => !v)}>
                        <SortAsc className="h-4 w-4" /> {sortKeys ? 'Unsort' : 'Sort keys'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle deep key sorting</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={!output} className="gap-1" onClick={() => copy(output)}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy output to clipboard</TooltipContent>
                  </Tooltip>
                </div>
              </CardTitle>
              <CardDescription>Formatted/minified JSON or tool results will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-3">
                  <Textarea value={output} readOnly placeholder="Your formatted JSON will appear here" className="min-h-[360px] font-mono" />
                </TabsContent>
                <TabsContent value="raw" className="mt-3">
                  <Textarea value={input} readOnly placeholder="Original input (read-only)" className="min-h-[360px] font-mono" />
                </TabsContent>
                <TabsContent value="tools" className="mt-3 space-y-4">
                  {/* JSONPath-lite */}
                  <GlassCard>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Search className="h-4 w-4" /> JSON Path
                      </CardTitle>
                      <CardDescription>Read a value by path (e.g., products[0].title or meta.site).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input value={pathQuery} onChange={(e) => setPathQuery(e.target.value)} placeholder="products[0].title" />
                        <Button variant="outline" onClick={doPathQuery} className="gap-2">
                          <Search className="h-4 w-4" /> Query
                        </Button>
                      </div>
                      <Textarea value={pathResult} readOnly placeholder="Result" className="min-h-[120px] font-mono" />
                    </CardContent>
                  </GlassCard>

                  {/* TypeScript */}
                  <GlassCard>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Type className="h-4 w-4" /> JSON → TypeScript
                      </CardTitle>
                      <CardDescription>Infer TypeScript types from the current JSON.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" onClick={toTypescript} className="gap-2">
                        <Braces className="h-4 w-4" /> Generate Types
                      </Button>
                      <Textarea value={output} readOnly placeholder="TypeScript output will appear in the main Output box" className="min-h-[120px] font-mono" />
                    </CardContent>
                  </GlassCard>

                  {/* Conversions */}
                  <GlassCard>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Hash className="h-4 w-4" /> Base64 / URL / Escapes
                      </CardTitle>
                      <CardDescription>Quick text conversions using the main input.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      <Button variant="outline" onClick={b64Encode}>
                        Base64 Encode
                      </Button>
                      <Button variant="outline" onClick={b64Decode}>
                        Base64 Decode
                      </Button>
                      <Button variant="outline" onClick={urlEncode}>
                        <Link2 className="mr-2 h-4 w-4" />
                        URL Encode
                      </Button>
                      <Button variant="outline" onClick={urlDecode}>
                        URL Decode
                      </Button>
                      <Button variant="outline" onClick={escapeStr}>
                        Escape
                      </Button>
                      <Button variant="outline" onClick={unescapeStr}>
                        Unescape
                      </Button>
                    </CardContent>
                  </GlassCard>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Indent: {indent === 'tab' ? 'tab' : indent} • Sort keys: {String(sortKeys)} • Auto-paste: {String(autoOnPaste)}
              </div>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Button variant="outline" onClick={() => download(output || '{}', 'formatted.json')} className="gap-2">
                <Download className="h-4 w-4" /> Download output
              </Button>
            </CardFooter>
          </MotionGlassCard>
        </div>

        {/* Footer help */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Keyboard: <kbd className="rounded bg-muted px-1">Ctrl</kbd> + <kbd className="rounded bg-muted px-1">Enter</kbd> to prettify • <kbd className="rounded bg-muted px-1">Ctrl</kbd> +{' '}
            <kbd className="rounded bg-muted px-1">M</kbd> to minify
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

// --- Example JSON ---
const example = `{
  "name": "Tariqul Islam",
  "title": "Full-Stack Developer",
  "skills": ["NextJS", "Express", "MongoDB", "Postgresql", "TypeScript", "Javascript", "Prisma", "Firebase", "Docker"],
  "hardWorker": true,
  "quickLearner": true,
  "problemSolver": true,
  "yearsOfExperience": "1++"
}`;

// --- Simple JSON → TS inference ---
function jsonToTs(name: string, val: any): string {
  const seen = new Map<any, string>();
  const lines: string[] = [];
  function typeOf(v: any): string {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
  }
  function pascal(s: string) {
    return s.replace(/(^|[_\-\s]+)([a-z])/g, (_, __, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
  }
  function emitInterface(intName: string, obj: any) {
    if (seen.has(obj)) return seen.get(obj)!;
    const rows: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k);
      const t = tsFor(v, pascal(k));
      rows.push(`  ${key}: ${t};`);
    }
    const block = `export interface ${intName} {\n${rows.join('\n')}\n}`;
    lines.push(block);
    seen.set(obj, intName);
    return intName;
  }
  function tsFor(v: any, hint: string): string {
    switch (typeOf(v)) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      case 'array': {
        const arr = v as any[];
        if (arr.length === 0) return 'unknown[]';
        const types = Array.from(new Set(arr.map((x) => tsFor(x, hint + 'Item'))));
        return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
      }
      case 'object': {
        const nameHere = pascal(hint || 'Object');
        emitInterface(nameHere, v);
        return nameHere;
      }
      default:
        return 'unknown';
    }
  }
  const rootName = pascal(name || 'Root');
  const rootType = tsFor(val, rootName);
  if (!lines.find((l) => l.includes(`interface ${rootType} `))) {
    // Primitive root
    lines.unshift(`export type ${rootName} = ${rootType}`);
  }
  return lines.join('\n\n');
}

// Bind keyboard shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      (document.querySelector('[data-prettify]') as HTMLButtonElement | null)?.click();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      (document.querySelector('[data-minify]') as HTMLButtonElement | null)?.click();
    }
  });
}
