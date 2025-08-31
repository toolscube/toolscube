'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Eraser, FileText, RotateCcw, Sparkles, Type, Upload } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

// -----------------------------------
// Helpers
// -----------------------------------

const LS_KEY = 'text-cleaner-input-v1';

function normalizeEOL(s: string) {
  return s.replace(/\r\n?/g, '\n');
}

function countWords(s: string) {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function stripHtmlTags(s: string) {
  // remove script/style blocks then tags
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '');
}

function decodeHtmlEntities(html: string) {
  if (!html) return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function smartQuotesToStraight(s: string) {
  return (
    s
      // single quotes/apostrophes
      .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
      // double quotes
      .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
      // ellipsis
      .replace(/[\u2026]/g, '...')
      // dashes
      .replace(/[\u2013\u2014]/g, '-')
      // bullets
      .replace(/[\u2022]/g, '-')
  );
}

function removeEmojis(s: string) {
  // Remove pictographic emoji + variation selector
  return s.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '');
}

function removeUrls(s: string) {
  return s.replace(/\b(?:https?:\/\/|www\.)\S+/gi, '');
}

function removeEmails(s: string) {
  return s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '');
}

function removePunctuation(s: string) {
  return s.replace(/[^\p{L}\p{N}\s]/gu, '');
}

function removeDiacritics(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function keepAsciiOnly(s: string) {
  return s.replace(/[^\x00-\x7F]+/g, '');
}

function collapseSpaces(s: string) {
  return s.replace(/[ \t]+/g, ' ');
}

function collapseNewlines(s: string) {
  // turn 3+ or 2+ newlines to a single newline
  return s.replace(/\n{2,}/g, '\n');
}

function trimEachLine(s: string) {
  return normalizeEOL(s)
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
}

function removeEmptyLines(s: string) {
  return normalizeEOL(s)
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .join('\n');
}

function toSentenceCase(s: string) {
  const lower = s.toLowerCase();
  const parts = lower.split(/([.!?]+\s+)/);
  for (let i = 0; i < parts.length; i += 2) {
    const seg = parts[i];
    if (seg && seg.trim()) {
      parts[i] = seg.replace(/^[\s]*([a-zA-Z\p{L}])/u, (m) => m.toUpperCase());
    }
  }
  return parts.join('');
}

const LITTLE_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via']);
function toTitleCase(s: string) {
  const words = s.toLowerCase().split(/(\s+)/);
  return words
    .map((w, i) => {
      if (/^\s+$/.test(w)) return w; // spaces
      if (i === 0 || i === words.length - 1) return w.charAt(0).toUpperCase() + w.slice(1);
      return LITTLE_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join('');
}

// -----------------------------------
// Component
// -----------------------------------

type CaseMode = 'none' | 'lower' | 'upper' | 'sentence' | 'title';

export default function TextCleanerPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // toggles
  const [trimEnds, setTrimEnds] = useState(true);
  const [doCollapseSpaces, setDoCollapseSpaces] = useState(true);
  const [doCollapseNewlines, setDoCollapseNewlines] = useState(true);
  const [doTrimEachLine, setDoTrimEachLine] = useState(true);
  const [doRemoveEmptyLines, setDoRemoveEmptyLines] = useState(true);
  const [doSmartToStraight, setDoSmartToStraight] = useState(true);
  const [doStripHtml, setDoStripHtml] = useState(false);
  const [doDecodeEntities, setDoDecodeEntities] = useState(false);
  const [doRemoveUrls, setDoRemoveUrls] = useState(false);
  const [doRemoveEmails, setDoRemoveEmails] = useState(false);
  const [doRemoveEmojis, setDoRemoveEmojis] = useState(false);
  const [doRemovePunct, setDoRemovePunct] = useState(false);
  const [doRemoveDiacritics, setDoRemoveDiacritics] = useState(false);
  const [doAsciiOnly, setDoAsciiOnly] = useState(false);
  const [caseMode, setCaseMode] = useState<CaseMode>('none');

  const fileRef = useRef<HTMLInputElement>(null);

  // persist input
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setInput(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, input);
    } catch {}
  }, [input]);

  const before = useMemo(() => normalizeEOL(input), [input]);
  const statsBefore = useMemo(
    () => ({
      chars: before.length,
      words: countWords(before),
      lines: before.split('\n').length,
    }),
    [before],
  );

  const statsAfter = useMemo(
    () => ({
      chars: output.length,
      words: countWords(output),
      lines: normalizeEOL(output).split('\n').length,
    }),
    [output],
  );

  function clean() {
    let s = input ?? '';
    if (doDecodeEntities) s = decodeHtmlEntities(s);
    if (doStripHtml) s = stripHtmlTags(s);
    if (doSmartToStraight) s = smartQuotesToStraight(s);
    if (doRemoveUrls) s = removeUrls(s);
    if (doRemoveEmails) s = removeEmails(s);
    if (doRemoveEmojis) s = removeEmojis(s);
    if (doRemovePunct) s = removePunctuation(s);
    if (doRemoveDiacritics) s = removeDiacritics(s);
    if (doAsciiOnly) s = keepAsciiOnly(s);

    // line-level
    if (doTrimEachLine) s = trimEachLine(s);
    if (doRemoveEmptyLines) s = removeEmptyLines(s);

    // whitespace
    if (doCollapseSpaces) s = collapseSpaces(s);
    if (doCollapseNewlines) s = collapseNewlines(s);
    if (trimEnds) s = s.trim();

    // case
    switch (caseMode) {
      case 'lower':
        s = s.toLowerCase();
        break;
      case 'upper':
        s = s.toUpperCase();
        break;
      case 'sentence':
        s = toSentenceCase(s);
        break;
      case 'title':
        s = toTitleCase(s);
        break;
      default:
        break;
    }

    setOutput(s);
  }

  function resetAll() {
    setInput('');
    setOutput('');
    setTrimEnds(true);
    setDoCollapseSpaces(true);
    setDoCollapseNewlines(true);
    setDoTrimEachLine(true);
    setDoRemoveEmptyLines(true);
    setDoSmartToStraight(true);
    setDoStripHtml(false);
    setDoDecodeEntities(false);
    setDoRemoveUrls(false);
    setDoRemoveEmails(false);
    setDoRemoveEmojis(false);
    setDoRemovePunct(false);
    setDoRemoveDiacritics(false);
    setDoAsciiOnly(false);
    setCaseMode('none');
  }

  function copyOut() {
    const v = output || input;
    if (!v) return;
    navigator.clipboard.writeText(v);
  }

  function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || ''));
    reader.readAsText(f);
    e.target.value = '';
  }

  function downloadOut() {
    const name = 'cleaned.txt';
    const blob = new Blob([output || input], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6" /> Text Cleaner
          </h1>
          <p className="text-sm text-muted-foreground">Remove extra spaces, emojis, HTML, special characters; normalize quotes/dashes; change case.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="text/plain,.txt,.csv,.md,.html" className="hidden" onChange={importFile} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" onClick={downloadOut} className="gap-2" disabled={!input && !output}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={clean} className="gap-2">
            <Sparkles className="h-4 w-4" /> Clean
          </Button>
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
          <CardDescription>Paste your text below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea
            className="min-h-[220px] font-mono"
            placeholder={`  “Hello”—world!  Visit https://example.com\n\n<p>Bangla: দেশ — ভালো? 😊`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs text-muted-foreground">
            <div className="rounded-md border p-2">
              Chars: <strong>{statsBefore.chars}</strong>
            </div>
            <div className="rounded-md border p-2">
              Words: <strong>{statsBefore.words}</strong>
            </div>
            <div className="rounded-md border p-2">
              Lines: <strong>{statsBefore.lines}</strong>
            </div>
            <div className="rounded-md border p-2">
              → Chars: <strong>{statsAfter.chars}</strong>
            </div>
            <div className="rounded-md border p-2">
              → Words: <strong>{statsAfter.words}</strong>
            </div>
            <div className="rounded-md border p-2">
              → Lines: <strong>{statsAfter.lines}</strong>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Options */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Cleaning Options</CardTitle>
          <CardDescription>Pick what to remove/normalize. Case is applied last.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3 space-y-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Whitespace & Lines
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trim ends</span>
                  <Switch checked={trimEnds} onCheckedChange={(v) => setTrimEnds(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collapse spaces</span>
                  <Switch checked={doCollapseSpaces} onCheckedChange={(v) => setDoCollapseSpaces(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collapse newlines</span>
                  <Switch checked={doCollapseNewlines} onCheckedChange={(v) => setDoCollapseNewlines(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trim each line</span>
                  <Switch checked={doTrimEachLine} onCheckedChange={(v) => setDoTrimEachLine(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remove empty lines</span>
                  <Switch checked={doRemoveEmptyLines} onCheckedChange={(v) => setDoRemoveEmptyLines(Boolean(v))} />
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" /> Text Normalization
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart → straight quotes/dashes</span>
                  <Switch checked={doSmartToStraight} onCheckedChange={(v) => setDoSmartToStraight(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Strip HTML tags</span>
                  <Switch checked={doStripHtml} onCheckedChange={(v) => setDoStripHtml(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Decode HTML entities</span>
                  <Switch checked={doDecodeEntities} onCheckedChange={(v) => setDoDecodeEntities(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remove URLs</span>
                  <Switch checked={doRemoveUrls} onCheckedChange={(v) => setDoRemoveUrls(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remove emails</span>
                  <Switch checked={doRemoveEmails} onCheckedChange={(v) => setDoRemoveEmails(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remove emojis</span>
                  <Switch checked={doRemoveEmojis} onCheckedChange={(v) => setDoRemoveEmojis(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remove punctuation</span>
                  <Switch checked={doRemovePunct} onCheckedChange={(v) => setDoRemovePunct(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remove diacritics (accents)</span>
                  <Switch checked={doRemoveDiacritics} onCheckedChange={(v) => setDoRemoveDiacritics(Boolean(v))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ASCII only</span>
                  <Switch checked={doAsciiOnly} onCheckedChange={(v) => setDoAsciiOnly(Boolean(v))} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[260px_1fr] sm:items-center">
            <div className="space-y-2">
              <Label>Change Case</Label>
              <Select value={caseMode} onValueChange={(v: CaseMode) => setCaseMode(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="none" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="lower">lowercase</SelectItem>
                  <SelectItem value="upper">UPPERCASE</SelectItem>
                  <SelectItem value="sentence">Sentence case</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={clean} className="gap-2">
                <Sparkles className="h-4 w-4" /> Apply Cleaning
              </Button>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Output */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Output</CardTitle>
          <CardDescription>Result after cleaning. You can copy, export, or replace input.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea className="min-h-[220px] font-mono" value={output} onChange={(e) => setOutput(e.target.value)} placeholder="Click Clean to generate output." />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={downloadOut} disabled={!output && !input}>
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>
              <Copy className="h-4 w-4" /> Copy Output
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setInput(output)} disabled={!output}>
              <Eraser className="h-4 w-4" /> Replace Input
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
