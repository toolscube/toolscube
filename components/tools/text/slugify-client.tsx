"use client";

import { Eraser, Info, List, Type, Wand2 as Wand } from "lucide-react";
import * as React from "react";
import toast from "react-hot-toast";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "single" | "batch";
type PresetKey = "seo" | "github" | "id" | "raw";

const delimiterFromKey = (k: DelimiterKey): DelimiterChar =>
  k === "dash" ? "-" : k === "underscore" ? "_" : "";

/* Slugify Core */
function deburr(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function applyCustomMap(text: string, map: Record<string, string>) {
  const entries = Object.entries(map)
    .filter(([k]) => k.length > 0)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of entries) {
    const re = new RegExp(escapeRegExp(from), "g");
    text = text.replace(re, to);
  }
  return text;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text: string) {
  return text.split(/[^A-Za-z0-9_]+/).filter(Boolean);
}

function removeStopwords(tokens: string[], stop: string[]) {
  if (!stop.length) return tokens;
  const set = new Set(stop.map((w) => w.toLowerCase().trim()).filter(Boolean));
  return tokens.filter((t) => !set.has(t.toLowerCase()));
}

function toWordsFromCamel(text: string) {
  return text.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d+)/g, "$1 $2");
}

function slugify(input: string, o: Options): string {
  let s = input ?? "";

  s = toWordsFromCamel(s);
  s = applyCustomMap(s, o.customMap);
  if (o.transliterate) s = deburr(s);
  if (o.trim) s = s.trim();

  s = s.replace(/[^\p{Letter}\p{Number}_]+/gu, " ");

  let tokens = tokenize(s);
  tokens = removeStopwords(tokens, o.stopwords);

  if (!o.keepNumbers) tokens = tokens.filter((t) => !/^\d+$/.test(t));

  let out = tokens.join(o.delimiter || "");

  if (o.collapse && o.delimiter) {
    const re = new RegExp(`${escapeRegExp(o.delimiter)}{2,}`, "g");
    out = out.replace(re, o.delimiter);
  }

  if (o.delimiter)
    out = out.replace(
      new RegExp(`^${escapeRegExp(o.delimiter)}|${escapeRegExp(o.delimiter)}$`, "g"),
      "",
    );

  if (o.lowercase) out = out.toLowerCase();

  if (o.maxLen > 0 && out.length > o.maxLen) {
    if (o.delimiter && out.includes(o.delimiter)) {
      const parts = out.split(o.delimiter);
      const keep: string[] = [];
      let len = 0;
      for (const p of parts) {
        const add = (len ? o.delimiter.length : 0) + p.length;
        if (len + add > o.maxLen) break;
        keep.push(p);
        len += add;
      }
      out = keep.length ? keep.join(o.delimiter) : out.slice(0, o.maxLen);
    } else {
      out = out.slice(0, o.maxLen);
    }
  }

  if (o.preserveUnderscore) {
    if (o.delimiter && o.delimiter !== "_") out = out.replace(/_+/g, o.delimiter);
  } else {
    if (o.delimiter && o.delimiter !== "_") out = out.replace(/_+/g, o.delimiter);
    else if (!o.delimiter) out = out.replace(/_+/g, "");
  }

  return out;
}

export default function SlugifyPage() {
  const [mode, setMode] = React.useState<Mode>("single");
  const [input, setInput] = React.useState<string>("");
  const [batchInput, setBatchInput] = React.useState<string>("");
  const [output, setOutput] = React.useState<string>("");
  const [batchOutput, setBatchOutput] = React.useState<string>("");
  const [live, setLive] = React.useState<boolean>(true);

  const [delimiterKey, setDelimiterKey] = React.useState<DelimiterKey>("dash");
  const [lowercase, setLowercase] = React.useState(true);
  const [trim, setTrim] = React.useState(true);
  const [transliterate, setTransliterate] = React.useState(true);
  const [collapse, setCollapse] = React.useState(true);
  const [preserveUnderscore, setPreserveUnderscore] = React.useState(false);
  const [keepNumbers, setKeepNumbers] = React.useState(true);
  const [maxLen, setMaxLen] = React.useState<number>(0);
  const [stopwordText, setStopwordText] = React.useState<string>(
    "a, an, the, and, or, of, for, with",
  );
  const [customMapText, setCustomMapText] = React.useState<string>("™ =>\n& => and\n@ => at");

  const opts: Options = React.useMemo(
    () => ({
      delimiter: delimiterFromKey(delimiterKey),
      lowercase,
      trim,
      transliterate,
      collapse,
      preserveUnderscore,
      keepNumbers,
      maxLen,
      stopwords: parseStopwords(stopwordText),
      customMap: parseCustomMap(customMapText),
    }),
    [
      delimiterKey,
      lowercase,
      trim,
      transliterate,
      collapse,
      preserveUnderscore,
      keepNumbers,
      maxLen,
      stopwordText,
      customMapText,
    ],
  );

 const runSingle = React.useCallback(() => {
  setOutput(slugify(input, opts));
}, [input, opts]);

  const runBatch = React.useCallback(() => {
    const lines = (batchInput || "").split(/\r?\n/);
    const slugs = lines.map((l) => slugify(l, opts));
    setBatchOutput(slugs.join("\n"));
  }, [batchInput, opts]);

  // unify into one stable runner
  const runCurrent = React.useCallback(() => {
    if (mode === "single") runSingle();
    else runBatch();
  }, [mode, runSingle, runBatch]);

  // only effect you need
  React.useEffect(() => {
    if (!live) return;
    runCurrent();
  }, [live, runCurrent]);

  const resetAll = () => {
    setInput("");
    setBatchInput("");
    setOutput("");
    setBatchOutput("");
    setDelimiterKey("dash");
    setLowercase(true);
    setTrim(true);
    setTransliterate(true);
    setCollapse(true);
    setPreserveUnderscore(false);
    setKeepNumbers(true);
    setMaxLen(0);
    setStopwordText("a, an, the, and, or, of, for, with");
    setCustomMapText("™ =>\n& => and\n@ => at");
    toast.success("Reset complete");
  };

  const applyPreset = (key: "seo" | "github" | "id" | "raw") => {
    if (key === "seo") {
      setDelimiterKey("dash");
      setLowercase(true);
      setTransliterate(true);
      setCollapse(true);
      setMaxLen(80);
    } else if (key === "github") {
      setDelimiterKey("dash");
      setLowercase(true);
      setTransliterate(true);
      setCollapse(true);
      setPreserveUnderscore(false);
      setMaxLen(100);
    } else if (key === "id") {
      setDelimiterKey("none");
      setLowercase(true);
      setTransliterate(true);
      setCollapse(true);
      setKeepNumbers(true);
      setMaxLen(32);
    } else {
      setDelimiterKey("dash");
      setLowercase(false);
      setTransliterate(false);
      setCollapse(true);
      setMaxLen(0);
    }
  };

  const presetButtons: { label: string; preset: PresetKey }[] = [
    { label: "SEO Blog", preset: "seo" },
    { label: "GitHub Anchor", preset: "github" },
    { label: "Compact ID", preset: "id" },
    { label: "Raw", preset: "raw" },
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Type}
        title="Slugify"
        description="Convert titles and phrases into clean, URL-safe slugs."
      />

      {/* Presets + Controls */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {presetButtons.map((item) => (
              <ActionButton
                key={item.preset}
                size="sm"
                variant="outline"
                label={item.label}
                onClick={() => applyPreset(item.preset)}
              />
            ))}

            <ResetButton className="ml-auto" onClick={resetAll} />
          </div>

          <div className="flex items-start gap-4 flex-wrap">
            <SelectField
              label="Delimiter"
              placeholder="Choose"
              value={delimiterKey}
              onValueChange={(v) => setDelimiterKey(v as DelimiterKey)}
              options={[
                { label: "Dash (-)", value: "dash" },
                { label: "Underscore (_)", value: "underscore" },
                { label: "None (concat)", value: "none" },
              ]}
            />

            <InputField
              id="maxLen"
              label="Max length (0 = off)"
              type="number"
              min={0}
              max={200}
              value={maxLen || ""}
              onChange={(e) => setMaxLen(Math.max(0, Number(e.target.value) || 0))}
            />

            <SwitchRow
              className="ml-auto"
              label="Live mode"
              hint="Apply changes as you type."
              checked={live}
              onCheckedChange={setLive}
            />

            <div className="grid grid-cols-2 gap-3 w-full">
              <SwitchRow label="Lowercase" checked={lowercase} onCheckedChange={setLowercase} />
              <SwitchRow label="Trim edges" checked={trim} onCheckedChange={setTrim} />
              <SwitchRow
                label="Transliterate"
                hint="Remove accents/diacritics"
                checked={transliterate}
                onCheckedChange={setTransliterate}
              />
              <SwitchRow
                label="Collapse repeats"
                checked={collapse}
                onCheckedChange={setCollapse}
              />
              <SwitchRow
                label="Keep numbers"
                checked={keepNumbers}
                onCheckedChange={setKeepNumbers}
              />
              <SwitchRow
                label="Preserve _"
                checked={preserveUnderscore}
                onCheckedChange={setPreserveUnderscore}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="grid gap-4">
            <InputField
              label="Stopwords (comma-separated)"
              value={stopwordText}
              onChange={(e) => setStopwordText(e.target.value)}
              placeholder="a, an, the, and…"
            />

            <TextareaField
              label="Custom replacements (one per line, “from - to”)"
              textareaClassName="min-h-[175px]"
              value={customMapText}
              onValueChange={setCustomMapText}
              placeholder={`™ => \n& => and\n@ => at`}
              autoResize
              trimOnBlur
            />
          </div>
        </GlassCard>
      </div>

      <Separator />

      {/* Tabs: Single / Batch */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="gap-2">
            <Type className="h-4 w-4" /> Single
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <List className="h-4 w-4" /> Batch
          </TabsTrigger>
        </TabsList>

        {/* Single */}
        <TabsContent value="single">
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Input</Label>
                <div className="flex gap-2">
                  <ResetButton icon={Eraser} label="Clear" onClick={() => setInput("")} />
                  <CopyButton variant="default" getText={() => input} />
                </div>
              </div>

              <TextareaField
                value={input}
                onValueChange={setInput}
                onKeyUp={(e) => {
                  if (!live && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    runSingle();
                  }
                }}
                placeholder={
                  live ? "Write a title to slugify…" : "Write a title… (Ctrl/Cmd + Enter to run)"
                }
                textareaClassName="min-h-[250px]"
              />

              {/* Show run button ONLY in Manual mode */}
              {!live && (
                <ActionButton variant="default" icon={Wand} onClick={runSingle} label="Slugify" />
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Output</Label>
                  <Badge variant="secondary" className="gap-1">
                    <Info className="h-3.5 w-3.5" />
                    {live ? "Live" : "Manual"}
                  </Badge>
                </div>
                <CopyButton getText={() => output} />
              </div>

              <TextareaField
                readOnly
                value={output}
                placeholder="Result will appear here…"
                textareaClassName="min-h-[200px]"
                autoResize
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Length: <code className="rounded bg-muted px-1">{output.length}</code>
                </span>
                <span>
                  Delimiter:{" "}
                  <code className="rounded bg-muted px-1">
                    {(() => {
                      const d = delimiterFromKey(delimiterKey);
                      return d || "(none)";
                    })()}
                  </code>
                </span>
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* Batch */}
        <TabsContent value="batch">
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Input (one title per line)</Label>
                <div className="flex gap-2">
                  <ResetButton icon={Eraser} onClick={() => setBatchInput("")} label="Clear" />
                  <CopyButton variant="default" getText={() => batchInput} />
                </div>
              </div>

              <TextareaField
                value={batchInput}
                onValueChange={setBatchInput}
                placeholder={
                  live
                    ? "My First Post\n10 Tips for SEO\nবাংলা শিরোনামও সমর্থিত"
                    : "My First Post\n10 Tips for SEO\nবাংলা শিরোনামও সমর্থিত\n(Ctrl/Cmd + Enter to run)"
                }
                onKeyUp={(e) => {
                  if (!live && e.key === "Enter" && (e.ctrlKey || e.metaKey)) runBatch();
                }}
                textareaClassName="min-h-[250px]"
                autoResize
              />

              {/* Show run button ONLY in Manual mode */}
              {!live && (
                <ActionButton
                  variant="default"
                  icon={Wand}
                  label="Slugify List"
                  onClick={runBatch}
                />
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Output (one slug per line)</Label>
                <CopyButton variant="default" getText={() => batchOutput} />
              </div>

              <TextareaField
                readOnly
                value={batchOutput}
                placeholder="result-one\nresult-two\nresult-three"
                textareaClassName="min-h-[200px]"
                autoResize
              />

              <div className="text-xs text-muted-foreground">
                Lines:{" "}
                <code className="rounded bg-muted px-1">
                  {batchOutput ? batchOutput.split("\n").length : 0}
                </code>
              </div>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

/* Parsers */

function parseStopwords(text: string): string[] {
  return text
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
}

function parseCustomMap(text: string): Record<string, string> {
  const map: Record<string, string> = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^(.*?)(?:\s*=>\s*)(.*)$/);
    if (!m) continue;
    const from = (m[1] ?? "").trim();
    const to = (m[2] ?? "").trim();
    if (from.length) map[from] = to;
  }
  return map;
}
