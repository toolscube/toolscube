"use client";

import { AlignLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

// Static Latin word bank (classic + a bit extended)
const WORDS =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    /\s+/,
  );

// Simple deterministic RNG (mulberry32)
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function capitalizeFirst(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

type GenOptions = {
  wordsPerParagraph: number;
  startWithClassic: boolean;
  punctuation: boolean;
  rng: () => number;
};

function generateParagraph(opts: GenOptions): string {
  const { wordsPerParagraph, startWithClassic, punctuation, rng } = opts;
  const parts: string[] = [];

  for (let i = 0; i < wordsPerParagraph; i++) {
    const w = WORDS[Math.floor(rng() * WORDS.length)] || "lorem";
    parts.push(w.toLowerCase());
  }

  // Optional punctuation sprinkles: commas roughly every ~10-16 words
  if (punctuation && parts.length > 8) {
    const step = 10 + Math.floor(rng() * 6); // 10..15
    for (let i = step; i < parts.length - 4; i += step) {
      parts[i] = parts[i].replace(/,$/, "");
      parts[i] += ",";
    }
  }

  let sentence = parts.join(" ").replace(/\s+,/g, ",");
  sentence = capitalizeFirst(sentence);
  if (!/[.!?]$/.test(sentence)) sentence += ".";

  if (startWithClassic) {
    const classic = "Lorem ipsum dolor sit amet,";
    if (!sentence.startsWith("Lorem ipsum")) {
      sentence = `${classic} ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
      sentence = capitalizeFirst(sentence);
    }
  }

  return sentence;
}

export default function LoremIpsumClient() {
  // Controls
  const [paragraphs, setParagraphs] = useState<number>(3);
  const [words, setWords] = useState<number>(50);
  const [startWithClassic, setStartWithClassic] = useState<boolean>(true);
  const [punctuation, setPunctuation] = useState<boolean>(true);
  const [deterministic, setDeterministic] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1_000_000));
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [separatorBlankLine, setSeparatorBlankLine] = useState<boolean>(true);

  // Output
  const [output, setOutput] = useState<string[]>([]);

  // Derived
  // const rng = useMemo(
  //   () => (deterministic ? mulberry32(seed) : Math.random),
  //   [deterministic, seed],
  // );

  const run = useCallback(() => {
    const localRng = deterministic ? mulberry32(seed) : Math.random; // stable for a single run
    const paras: string[] = [];
    for (let p = 0; p < Math.max(1, paragraphs); p++) {
      paras.push(
        generateParagraph({
          wordsPerParagraph: Math.max(5, words),
          startWithClassic: startWithClassic && p === 0,
          punctuation,
          rng: localRng,
        }),
      );
    }
    setOutput(paras);
  }, [paragraphs, words, startWithClassic, punctuation, deterministic, seed]);

  useEffect(() => {
    if (autoRun) run();
  }, [autoRun, run]);

  function resetAll() {
    setParagraphs(3);
    setWords(50);
    setStartWithClassic(true);
    setPunctuation(true);
    setDeterministic(false);
    setSeed(Math.floor(Math.random() * 1_000_000));
    setSeparatorBlankLine(true);
    setOutput([]);
    setAutoRun(true);
  }

  const outputText = useMemo(
    () => (separatorBlankLine ? output.join("\n\n") : output.join("\n")),
    [output, separatorBlankLine],
  );

  const stats = useMemo(() => {
    const chars = outputText.length;
    const wordsCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
    return { paras: output.length, words: wordsCount, chars };
  }, [outputText, output.length]);

  return (
    <>
      <ToolPageHeader
        icon={AlignLeft}
        title="Lorem Ipsum Generator"
        description="Fast, tweakable filler text for mockups, layouts, and testing."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton getText={() => outputText} disabled={!outputText} />
            <ExportTextButton
              variant="default"
              filename="lorem-ipsum.txt"
              getText={() => outputText || ""}
              disabled={!outputText}
            />
          </>
        }
      />

      {/* Top stats */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Paragraphs" value={stats.paras} hint="Generated" />
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.chars} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Settings */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Adjust paragraphs and words per paragraph.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Paragraphs"
                type="number"
                min={1}
                max={50}
                value={String(paragraphs)}
                onChange={(e) => setParagraphs(Math.max(1, Number(e.target.value) || 1))}
              />
              <InputField
                label="Words / paragraph"
                type="number"
                min={5}
                max={400}
                value={String(words)}
                onChange={(e) => setWords(Math.max(5, Number(e.target.value) || 5))}
              />
            </div>

            <SwitchRow
              label="Start with ‘Lorem ipsum…’"
              checked={startWithClassic}
              onCheckedChange={(v) => setStartWithClassic(Boolean(v))}
            />
            <SwitchRow
              label="Add punctuation"
              hint="Sprinkle commas and end with a period"
              checked={punctuation}
              onCheckedChange={(v) => setPunctuation(Boolean(v))}
            />
            <SwitchRow
              label="Blank line between paragraphs"
              checked={separatorBlankLine}
              onCheckedChange={(v) => setSeparatorBlankLine(Boolean(v))}
            />

            <Separator />

            <SwitchRow
              label="Deterministic"
              hint="Enable seeded generation for reproducible output"
              checked={deterministic}
              onCheckedChange={(v) => setDeterministic(Boolean(v))}
            />
            <InputField
              label="Seed"
              type="number"
              value={String(seed)}
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
              disabled={!deterministic}
            />
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            <ActionButton label="Generate" icon={AlignLeft} onClick={run} />
            <ActionButton
              label="1 para"
              variant="outline"
              onClick={() => {
                setParagraphs(1);
                setWords(80);
                if (!autoRun) run();
              }}
            />
            <ActionButton
              label="3 para"
              variant="outline"
              onClick={() => {
                setParagraphs(3);
                setWords(60);
                if (!autoRun) run();
              }}
            />
            <ActionButton
              label="5 para"
              variant="outline"
              onClick={() => {
                setParagraphs(5);
                setWords(50);
                if (!autoRun) run();
              }}
            />
            <SwitchRow
              label="Auto‑generate"
              checked={autoRun}
              onCheckedChange={(v) => setAutoRun(Boolean(v))}
            />
          </CardFooter>
        </GlassCard>

        {/* Right: Output */}
        <GlassCard className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Output</CardTitle>
            <CardDescription>Your generated Lorem Ipsum text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {output.length === 0 ? (
              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                No text yet. Click <em>Generate</em> or enable Auto‑generate.
              </div>
            ) : (
              <TextareaField
                readOnly
                value={outputText}
                onValueChange={() => {}}
                textareaClassName="min-h-[240px] font-mono"
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <CopyButton getText={() => outputText} disabled={!outputText} />
            <ExportTextButton
              filename="lorem-ipsum.txt"
              getText={() => outputText}
              disabled={!outputText}
            />
          </CardFooter>
        </GlassCard>
      </div>
    </>
  );
}
