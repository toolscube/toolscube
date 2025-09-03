"use client";

import { AlignLeft, Copy, RotateCcw } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function generateLorem(paragraphs: number, wordsPerParagraph: number): string[] {
  const LOREM =
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
      " ",
    );

  const paras: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const words: string[] = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      words.push(LOREM[Math.floor(Math.random() * LOREM.length)]);
    }
    const para = words.join(" ");
    paras.push(para.charAt(0).toUpperCase() + para.slice(1) + ".");
  }
  return paras;
}

export default function LoremIpsumPage() {
  const [paragraphs, setParagraphs] = React.useState(3);
  const [words, setWords] = React.useState(50);
  const [output, setOutput] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);

  function run() {
    setOutput(generateLorem(paragraphs, words));
  }

  function resetAll() {
    setParagraphs(3);
    setWords(50);
    setOutput([]);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(output.join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <MotionGlassCard className=" p-4 md:p-6 lg:p-8">
      <GlassCard className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <AlignLeft className="h-6 w-6" /> Lorem Ipsum Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate filler text for mockups, layouts, or testing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={copyAll} className="gap-2">
            <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy All"}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Adjust number of paragraphs and words per paragraph.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="paragraphs">Paragraphs</Label>
            <Input
              id="paragraphs"
              type="number"
              min={1}
              max={20}
              value={paragraphs}
              onChange={(e) => setParagraphs(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="words">Words / Paragraph</Label>
            <Input
              id="words"
              type="number"
              min={5}
              max={200}
              value={words}
              onChange={(e) => setWords(Number(e.target.value) || 5)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={run} className="gap-2">
            <AlignLeft className="h-4 w-4" /> Generate
          </Button>
        </CardFooter>
      </GlassCard>

      <Separator className="my-6" />

      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Output</CardTitle>
          <CardDescription>Your generated Lorem Ipsum text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {output.length === 0 && (
            <p className="text-sm text-muted-foreground">No text yet. Click Generate.</p>
          )}
          {output.map((para, i) => (
            <Textarea key={i} value={para} readOnly className="min-h-[100px] font-serif" />
          ))}
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
