"use client";

import { AlignLeft, BarChart2, Clock4, FileText, Info, Mic, Type as TypeIcon } from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  PasteButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/utils/case-converter";
import {
  computeDensity,
  countCharacters,
  countCharactersNoSpaces,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
  formatTimeFromWPM,
  normalizeText,
  slugify,
  squeezeSpaces,
} from "@/lib/utils/word-counter";

/* Quick Actions */
type Action = {
  key: string;
  label: string;
  run: () => void;
  hotkey?: string;
  span2?: boolean;
};

function QuickTransforms({
  toUpper,
  toLower,
  toTitle,
  toSlug,
  cleanSpaces,
}: {
  toUpper: () => void;
  toLower: () => void;
  toTitle: () => void;
  toSlug: () => void;
  cleanSpaces: () => void;
}) {
  const actions: Action[] = [
    { key: "upper", label: "UPPERCASE", run: toUpper },
    { key: "lower", label: "lowercase", run: toLower },
    { key: "title", label: "Title Case", run: toTitle },
    { key: "slug", label: "slugify", run: toSlug },
    { key: "clean", label: "Remove extra spaces & blank lines", run: cleanSpaces, span2: true },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((a) => (
        <ActionButton
          key={a.key}
          icon={AlignLeft}
          label={a.label}
          className={cn("justify-start", a.span2 && "sm:col-span-2")}
          onClick={a.run}
        />
      ))}
    </div>
  );
}

export default function WordCounterClient() {
  const [text, setText] = React.useState<string>("");

  const [liveClean, setLiveClean] = React.useState<boolean>(false);
  const [excludeStopwords, setExcludeStopwords] = React.useState<boolean>(true);

  const displayText = React.useMemo(
    () => (liveClean ? squeezeSpaces(normalizeText(text)) : normalizeText(text)),
    [text, liveClean],
  );

  const stats = React.useMemo(() => {
    const t = displayText;
    const words = countWords(t);
    return {
      words,
      chars: countCharacters(t),
      charsNoSpaces: countCharactersNoSpaces(t),
      sentences: countSentences(t),
      paragraphs: countParagraphs(t),
      lines: countLines(t),
      readTime: formatTimeFromWPM(words, 200),
      speakTime: formatTimeFromWPM(words, 130),
    };
  }, [displayText]);

  const density = React.useMemo(
    () => computeDensity(displayText, { excludeStopwords }),
    [displayText, excludeStopwords],
  );

  const resetAll = () => {
    setText("");
    setLiveClean(false);
    setExcludeStopwords(true);
  };

  const toUpper = () => setText(displayText.toUpperCase());
  const toLower = () => setText(displayText.toLowerCase());
  const toTitle = () => setText(toTitleCase(displayText));
  const toSlug = () => setText(slugify(displayText));
  const cleanSpaces = () => setText(squeezeSpaces(displayText));

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={TypeIcon}
        title="Word Counter"
        description="Count words, characters, sentences, paragraphs, and lines. Get reading/speaking time and keyword density."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton variant="default" getText={() => displayText || ""} />
          </>
        }
      />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Live cleanup & density options.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SwitchRow
            label="Live clean-up"
            hint="Collapse extra spaces and blank lines automatically."
            checked={liveClean}
            onCheckedChange={setLiveClean}
          />
          <SwitchRow
            label="Exclude stopwords"
            hint="Ignore common words in keyword density."
            checked={excludeStopwords}
            onCheckedChange={setExcludeStopwords}
          />
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Editor & Stats */}
      <section className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Your Text</Label>
            <div className="flex flex-wrap gap-2">
              <PasteButton
                variant="outline"
                size="sm"
                className="gap-2"
                label="Paste"
                pastedLabel="Pasted"
                smartNewline
                getExisting={() => text}
                setValue={setText}
              />

              <InputField
                accept=".txt,text/plain"
                type="file"
                onFilesChange={async (files) => {
                  const f = files?.[0];
                  if (!f) return;
                  const txt = await f.text();
                  setText(txt);
                }}
              />

              <ExportTextButton
                filename="text.txt"
                getText={() => displayText}
                label="Export"
                size="sm"
                disabled={!displayText}
              />
            </div>
          </div>

          <TextareaField
            value={text}
            onValueChange={setText}
            placeholder="Start typing or paste your text here…"
            textareaClassName="min-h-[260px]"
          />

          {/* Quick transforms (grid with hotkeys) */}
          <QuickTransforms
            toUpper={toUpper}
            toLower={toLower}
            toTitle={toTitle}
            toSlug={toSlug}
            cleanSpaces={cleanSpaces}
          />
        </GlassCard>

        {/* Stats */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Statistics</Label>
            <Badge variant="secondary" className="gap-1">
              <Info className="h-3.5 w-3.5" />
              Live
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatItem
              icon={<FileText className="h-4 w-4" />}
              label="Words"
              value={stats.words.toLocaleString()}
            />
            <StatItem
              icon={<TypeIcon className="h-4 w-4" />}
              label="Characters"
              value={stats.chars.toLocaleString()}
            />
            <StatItem
              icon={<TypeIcon className="h-4 w-4" />}
              label="Chars (no spaces)"
              value={stats.charsNoSpaces.toLocaleString()}
            />
            <StatItem
              icon={<AlignLeft className="h-4 w-4" />}
              label="Lines"
              value={stats.lines.toLocaleString()}
            />
            <StatItem
              icon={<AlignLeft className="h-4 w-4" />}
              label="Sentences"
              value={stats.sentences.toLocaleString()}
            />
            <StatItem
              icon={<AlignLeft className="h-4 w-4" />}
              label="Paragraphs"
              value={stats.paragraphs.toLocaleString()}
            />
            <StatItem
              icon={<Clock4 className="h-4 w-4" />}
              label="Read time (200 wpm)"
              value={stats.readTime}
            />
            <StatItem
              icon={<Mic className="h-4 w-4" />}
              label="Speak time (130 wpm)"
              value={stats.speakTime}
            />
          </div>
        </GlassCard>
      </section>

      {/* Density table */}
      <section>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <Label className="text-sm font-medium">Keyword Density (Top 20)</Label>
          </div>
          {density.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Type some text to see keyword frequency.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                    <th>Word</th>
                    <th>Count</th>
                    <th>Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {density.map((row) => (
                    <tr key={row.word} className="border-t">
                      <td className="px-3 py-1.5 font-mono">{row.word}</td>
                      <td className="px-3 py-1.5">{row.count}</td>
                      <td className="px-3 py-1.5">{row.percent.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </section>
    </>
  );
}

/* Subparts */
function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
