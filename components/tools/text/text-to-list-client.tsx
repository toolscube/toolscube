'use client';

import * as React from 'react';

import { CopyButton, DownloadTextButton, ExportCSVButton, ResetButton } from '@/components/shared/action-buttons';
import { InputField } from '@/components/shared/form-fields/input-field';
import SwitchRow from '@/components/shared/form-fields/switch-row';
import TextareaField from '@/components/shared/form-fields/textarea-field';
import ToolPageHeader from '@/components/shared/tool-page-header';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { History, ListChecks, Wand2 } from 'lucide-react';

const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

type CaseMode = 'none' | 'lower' | 'upper' | 'title';
type SortMode = 'none' | 'asc' | 'desc';

export default function TextToListClient() {
  /* State */
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
  const [copiedKind, setCopiedKind] = React.useState<'list' | 'joined' | null>(null);

  /* Processing */
  const processed = React.useMemo(() => {
    const parts = source
      .split(/[\n,;|\t]+/g)
      .map((s) => (collapseSpaces ? s.replace(/\s+/g, ' ') : s))
      .map((s) => (trimItems ? s.trim() : s));

    let items = removeEmpty ? parts.filter((s) => s.length > 0) : parts.slice();

    // Case transform first (predictable dedupe/sort)
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
    const baseline = source
      .split(/[\n,;|\t]+/g)
      .map((s) => (collapseSpaces ? s.replace(/\s+/g, ' ') : s))
      .map((s) => (trimItems ? s.trim() : s));
    const afterEmpty = removeEmpty ? baseline.filter(Boolean) : baseline.slice();
    const cased = caseMode === 'none' ? afterEmpty : afterEmpty.map((s) => (caseMode === 'upper' ? s.toUpperCase() : caseMode === 'lower' ? s.toLowerCase() : titleCase(s)));

    return {
      inputCount: baseline.length,
      nonEmptyCount: afterEmpty.length,
      uniqueCount: new Set(cased).size,
      outputCount: processed.length,
    };
  }, [source, collapseSpaces, trimItems, removeEmpty, caseMode, processed]);

  /* Actions */
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

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={ListChecks}
        title="Text to List"
        description="Split by comma/newline → clean list."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton label="Copy (newline)" copiedLabel="Copied" variant="outline" getText={() => processed.join('\n')} disabled={!processed.length} />
            <CopyButton label="Copy (comma)" copiedLabel="Copied" variant="outline" getText={() => processed.join(', ')} disabled={!processed.length} />
            <ExportCSVButton variant="outline" filename="clean-list.csv" label="CSV" disabled={!processed.length} getRows={() => [['Item'], ...processed.map((s) => [s])]} />
            <DownloadTextButton filename="clean-list.txt" getText={() => processed.join('\n')} label="TXT" disabled={!processed.length} />
          </>
        }
      />

      {/* Input */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Input Text</CardTitle>
          <CardDescription>Paste or type values separated by commas and/or new lines.</CardDescription>
        </CardHeader>
        <CardContent>
          <TextareaField
            value={source}
            onValueChange={setSource}
            textareaClassName="min-h-[180px] font-mono"
            placeholder={`e.g. apple, banana
orange
grape,  mango

pear`}
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

      <Separator />

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Clean and format your list exactly how you want.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <SwitchRow label="Trim items" hint="Remove leading/trailing whitespace." checked={trimItems} onCheckedChange={setTrimItems} />
            <SwitchRow label="Collapse spaces" hint="Convert multiple spaces/tabs to single space." checked={collapseSpaces} onCheckedChange={setCollapseSpaces} />
            <SwitchRow label="Remove empty" hint="Drop blank lines or empty segments." checked={removeEmpty} onCheckedChange={setRemoveEmpty} />
            <SwitchRow label="Dedupe" hint="Keep the first occurrence only." checked={dedupe} onCheckedChange={setDedupe} />
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
              <InputField name="prefix" label="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. - " />
              <InputField name="suffix" label="Suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. ;" />
            </div>

            <SwitchRow label="Numbering" hint="Add incremental numbers to each item." checked={numbering} onCheckedChange={setNumbering} />

            {numbering && (
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField name="numStart" label="Start" type="number" min={-999999} max={999999} value={String(numStart)} onChange={(e) => setNumStart(Number(e.target.value) || 1)} />
                <InputField name="numPad" label="Pad" type="number" min={0} max={8} value={String(numPad)} onChange={(e) => setNumPad(Math.max(0, Math.min(8, Number(e.target.value) || 0)))} />
                <InputField name="numSep" label="Separator" value={numSep} onChange={(e) => setNumSep(e.target.value)} placeholder=". " />
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

            <TextareaField readOnly value={processed.join('\n')} onValueChange={() => {}} textareaClassName="min-h-[200px]" />

            <div className="flex flex-wrap gap-2">
              <CopyButton variant="outline" size="sm" label={copiedKind === 'list' ? 'Copied' : 'Copy (newline)'} getText={() => processed.join('\n')} disabled={!processed.length} />
              <CopyButton variant="outline" size="sm" label={copiedKind === 'joined' ? 'Copied' : 'Copy (comma)'} getText={() => processed.join(', ')} disabled={!processed.length} />
              <ExportCSVButton variant="outline" filename="clean-list.csv" label="CSV" disabled={!processed.length} getRows={() => [['Item'], ...processed.map((s) => [s])]} />
              <DownloadTextButton size="sm" filename="clean-list.txt" getText={() => processed.join('\n')} label="TXT" disabled={!processed.length} />
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
    </>
  );
}
