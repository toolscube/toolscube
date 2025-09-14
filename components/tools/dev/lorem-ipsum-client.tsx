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
import { generateParagraph, mulberry32 } from "@/lib/utils/dev/lorem-ipsum";

export default function LoremIpsumClient() {
  const [paragraphs, setParagraphs] = useState<number>(3);
  const [words, setWords] = useState<number>(50);
  const [startWithClassic, setStartWithClassic] = useState<boolean>(true);
  const [punctuation, setPunctuation] = useState<boolean>(true);
  const [deterministic, setDeterministic] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1_000_000));
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [separatorBlankLine, setSeparatorBlankLine] = useState<boolean>(true);
  const [output, setOutput] = useState<string[]>([]);

  const run = useCallback(() => {
    const localRng = deterministic ? mulberry32(seed) : Math.random;
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
          <CardHeader className="flex items-end justify-between flex-wrap">
            <div>
              <CardTitle className="text-base">Output</CardTitle>
              <CardDescription>Your generated Lorem Ipsum text.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton getText={() => outputText} disabled={!outputText} />
              <ExportTextButton
                variant="default"
                filename="lorem-ipsum.txt"
                getText={() => outputText}
                disabled={!outputText}
              />
            </div>
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
                textareaClassName="min-h-[530px] font-mono"
              />
            )}
          </CardContent>
        </GlassCard>
      </div>
    </>
  );
}
