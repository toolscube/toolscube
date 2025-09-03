'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { CopyButton, ExportTextButton, PasteButton, ResetButton } from '@/components/shared/action-buttons';
import ToolPageHeader from '@/components/shared/tool-page-header';

import { InputField } from '@/components/shared/form-fields/input-field';
import SelectField from '@/components/shared/form-fields/select-field';
import SwitchRow from '@/components/shared/form-fields/switch-row';
import TextareaField from '@/components/shared/form-fields/textarea-field';
import { ArrowLeftRight, Eraser, Info, Replace, Type as TypeIcon, Wand2 } from 'lucide-react';

/* Utilities */
const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'for',
  'to',
  'in',
  'on',
  'at',
  'of',
  'is',
  'are',
  'am',
  'be',
  'was',
  'were',
  'it',
  'its',
  'that',
  'this',
  'with',
  'as',
  'by',
  'from',
  'or',
  'if',
  'then',
  'than',
  'so',
  'but',
  'not',
  'no',
  'we',
  'you',
  'i',
  'your',
  'our',
  'they',
  'he',
  'she',
  'them',
  'his',
  'her',
  'their',
  'my',
  'me',
  'us',
  'been',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'can',
  'could',
  'should',
  'would',
  'will',
  'just',
  'about',
  'into',
  'over',
  'under',
  'out',
  'up',
  'down',
  'again',
  'more',
  'most',
  'some',
  'such',
  'only',
  'own',
  'same',
  'other',
  'any',
  'each',
  'few',
]);

function normalizeLF(s: string) {
  return s.replace(/\r\n?/g, '\n');
}
function trimAll(s: string) {
  return s.trim();
}
function collapseSpaces(s: string) {
  return s
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}
function removePunctuation(s: string) {
  return s.replace(/[^\p{L}\p{N}\s]/gu, '');
}
function normalizeQuotes(s: string) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/—|–/g, '-');
}
function removeDiacritics(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function wordsFrom(s: string) {
  return s.match(/[\p{L}\p{N}]+/gu) || [];
}
function toCamel(words: string[]) {
  return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
}
function toPascal(words: string[]) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function toSnake(words: string[]) {
  return words.map((w) => w.toLowerCase()).join('_');
}
function toKebab(words: string[]) {
  return words.map((w) => w.toLowerCase()).join('-');
}
function toConstant(words: string[]) {
  return words.map((w) => w.toUpperCase()).join('_');
}
function toCapitalized(s: string) {
  return s.replace(/\b(\p{L})(\p{L}*)/gu, (_, a: string, b: string) => a.toUpperCase() + b.toLowerCase());
}
function toAlternating(s: string) {
  let i = 0;
  return s.replace(/./g, (ch) => {
    if (!/\S/.test(ch)) return ch;
    const out = i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
    i++;
    return out;
  });
}
function toInvert(s: string) {
  return s.replace(/\p{L}/gu, (ch) => (ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()));
}
function toSentenceCase(s: string) {
  const text = s.toLowerCase();
  return text.replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gmu, (m) => m.toUpperCase());
}
function toTitleCase(s: string) {
  return s.toLowerCase().replace(/\b(\p{L}[\p{L}\p{N}'’]*)\b/gu, (word, _grp, offset, full) => {
    const isFirst = offset === 0;
    const isLast = offset + word.length === full.length;
    const prev = full.slice(Math.max(0, offset - 2), offset);
    const afterPunct = /[\-–—:;.!?]\s?$/.test(prev);
    const lw = word.toLowerCase();
    if (!isFirst && !isLast && !afterPunct && SMALL_WORDS.has(lw)) return lw;
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  });
}

function applyCase(mode: CaseMode, s: string) {
  switch (mode) {
    case 'upper':
      return s.toUpperCase();
    case 'lower':
      return s.toLowerCase();
    case 'title':
      return toTitleCase(s);
    case 'sentence':
      return toSentenceCase(s);
    case 'camel':
      return toCamel(wordsFrom(s));
    case 'pascal':
      return toPascal(wordsFrom(s));
    case 'snake':
      return toSnake(wordsFrom(s));
    case 'kebab':
      return toKebab(wordsFrom(s));
    case 'constant':
      return toConstant(wordsFrom(s));
    case 'capitalized':
      return toCapitalized(s);
    case 'alternating':
      return toAlternating(s);
    case 'invert':
      return toInvert(s);
  }
}

function runPipeline(s: string, toggles: Record<PipelineToggle, boolean>) {
  let out = normalizeLF(s);
  if (toggles.trim) out = trimAll(out);
  if (toggles.collapseSpaces) out = collapseSpaces(out);
  if (toggles.normalizeQuotes) out = normalizeQuotes(out);
  if (toggles.removeDiacritics) out = removeDiacritics(out);
  if (toggles.removePunctuation) out = removePunctuation(out);
  return out;
}

export default function CaseConverterClient() {
  const [source, setSource] = React.useState<string>('');
  const [mode, setMode] = React.useState<CaseMode>('title');
  const [live, setLive] = React.useState<boolean>(true);

  const [toggles, setToggles] = React.useState<Record<PipelineToggle, boolean>>({
    trim: true,
    collapseSpaces: true,
    removePunctuation: false,
    normalizeQuotes: false,
    removeDiacritics: false,
  });

  const [customSep, setCustomSep] = React.useState<string>('');

  const processed = React.useMemo(() => runPipeline(source, toggles), [source, toggles]);
  const transformed = React.useMemo(() => {
    const base = applyCase(mode, processed);
    if (!customSep) return base;
    return base.replace(/\s+/g, customSep);
  }, [processed, mode, customSep]);

  const resetAll = () => {
    setSource('');
    setMode('title');
    setLive(true);
    setToggles({
      trim: true,
      collapseSpaces: true,
      removePunctuation: false,
      normalizeQuotes: false,
      removeDiacritics: false,
    });
    setCustomSep('');
  };

  const paste = async () => {
    try {
      const s = await navigator.clipboard.readText();
      setSource((prev) => (prev ? prev + (prev.endsWith('\n') ? '' : '\n') + s : s));
    } catch {}
  };

  const download = (which: 'src' | 'dst') => {
    const content = which === 'src' ? source : transformed;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = which === 'src' ? 'original.txt' : 'converted.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Presets — one click “opinionated” settings
  const presetSlug = () => {
    setMode('kebab');
    setToggles({ trim: true, collapseSpaces: true, removePunctuation: true, normalizeQuotes: true, removeDiacritics: true });
    setCustomSep('');
  };
  const presetCode = () => {
    setMode('snake');
    setToggles({ trim: true, collapseSpaces: true, removePunctuation: true, normalizeQuotes: true, removeDiacritics: true });
    setCustomSep('');
  };
  const presetSocial = () => {
    setMode('title');
    setToggles({ trim: true, collapseSpaces: true, removePunctuation: false, normalizeQuotes: true, removeDiacritics: false });
    setCustomSep('');
  };

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={TypeIcon}
        title="Case Converter"
        description="Upper, lower, title, camel/snake/kebab"
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton variant="default" label="Copy converted" getText={() => transformed || ''} />
          </>
        }
      />

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose a case style and optional clean-up pipeline.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-3">
          {/* Case mode */}
          <div className="space-y-2">
            <SelectField
              label="Case Style"
              placeholder="Choose case style"
              value={mode}
              onValueChange={(v) => setMode((v as CaseMode) ?? 'title')}
              allowClear={false}
              options={[
                { value: 'upper', label: 'UPPER' },
                { value: 'lower', label: 'lower' },
                { value: 'title', label: 'Title Case' },
                { value: 'sentence', label: 'Sentence case' },
                { value: 'camel', label: 'camelCase' },
                { value: 'pascal', label: 'PascalCase' },
                { value: 'snake', label: 'snake_case' },
                { value: 'kebab', label: 'kebab-case' },
                { value: 'constant', label: 'CONSTANT_CASE' },
                { value: 'capitalized', label: 'Capitalized' },
                { value: 'alternating', label: 'aLtErNaTiNg' },
                { value: 'invert', label: 'iNVERT cASE' },
              ]}
              description="How your text should be transformed."
              triggerClassName="w-full"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" className="gap-2" onClick={presetSlug}>
                <Wand2 className="h-4 w-4" /> Preset: Slug
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={presetCode}>
                <Wand2 className="h-4 w-4" /> Preset: Code
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={presetSocial}>
                <Wand2 className="h-4 w-4" /> Preset: Social
              </Button>
            </div>
          </div>

          {/* Pipeline toggles */}
          <div className="space-y-2">
            <Label className="text-sm">Clean-up Pipeline</Label>
            <div className="grid grid-cols-2 gap-2">
              <SwitchRow label="Trim ends" checked={toggles.trim} onCheckedChange={(v) => setToggles((t) => ({ ...t, trim: v }))} />
              <SwitchRow label="Collapse spaces/lines" checked={toggles.collapseSpaces} onCheckedChange={(v) => setToggles((t) => ({ ...t, collapseSpaces: v }))} />
              <SwitchRow label="Remove punctuation" checked={toggles.removePunctuation} onCheckedChange={(v) => setToggles((t) => ({ ...t, removePunctuation: v }))} />
              <SwitchRow label="Normalize quotes/dashes" checked={toggles.normalizeQuotes} onCheckedChange={(v) => setToggles((t) => ({ ...t, normalizeQuotes: v }))} />
              <SwitchRow label="Remove diacritics" checked={toggles.removeDiacritics} onCheckedChange={(v) => setToggles((t) => ({ ...t, removeDiacritics: v }))} />
            </div>
          </div>

          {/* Extras */}
          <div className="space-y-3">
            <SwitchRow label="Live mode" hint="Apply changes as you type." checked={live} onCheckedChange={setLive} />

            <InputField
              label="Replace whitespace with"
              id="customSep"
              placeholder="(Optional) e.g. _ or -"
              value={customSep}
              onChange={(e) => setCustomSep(e.target.value)}
              hint="Useful for custom slugs or tokens after conversion."
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Editor & Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Source */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label className="text-sm font-medium">Original Text</Label>
            <div className="flex flex-wrap gap-2">
              <PasteButton variant="outline" size="sm" className="gap-2" label="Paste" pastedLabel="Pasted" smartNewline getExisting={() => source} setValue={setSource} />

              <InputField
                accept=".txt,text/plain"
                type="file"
                onFilesChange={async (files) => {
                  const f = files?.[0];
                  if (!f) return;
                  const text = await f.text();
                  setSource(text);
                }}
              />

              <ExportTextButton filename="original.txt" getText={() => source} label="Export" size="sm" disabled={!source} />
            </div>
          </div>

          <TextareaField className="mt-2" textareaClassName="min-h-[260px]" value={source} onValueChange={setSource} placeholder="Type or paste text here…" autoResize showCount />

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-center gap-2" onClick={() => setSource('')}>
              <Eraser className="h-4 w-4" /> Clear
            </Button>

            <CopyButton getText={() => source || ''} />

            {!live && (
              <Button className="justify-start gap-2" onClick={() => setSource(transformed)}>
                <Replace className="h-4 w-4" /> Convert Text
              </Button>
            )}
          </div>
        </GlassCard>

        {/* Right: Converted */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label className="text-sm font-medium">Converted Preview</Label>
            <Badge variant="secondary" className="gap-1">
              <Info className="h-3.5 w-3.5" />
              {live ? 'Live' : 'Manual'}
            </Badge>
          </div>

          <TextareaField
            className="mt-2"
            textareaClassName="min-h-[260px]"
            value={live ? transformed : applyCase(mode, runPipeline(source, toggles)).replace(/\s+/g, customSep || '$&')}
            readOnly
            placeholder="Converted text will appear here…"
            autoResize
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton label="Copy converted" getText={() => transformed || ''} />
            <ExportTextButton filename="transformed.txt" getText={() => transformed} label="Export" size="sm" disabled={!transformed} />
            {!live && (
              <Button className="gap-2" onClick={() => setSource(transformed)}>
                <ArrowLeftRight className="h-4 w-4" /> Apply to source
              </Button>
            )}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
