"use client";

import {
  Calculator,
  ClipboardPaste,
  Copy,
  Delete,
  Divide,
  Equal,
  Eraser,
  FunctionSquare,
  Percent,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalcButton } from "@/components/calculators/calc-button";
import { Display } from "@/components/calculators/display";
import SectionHeader from "@/components/root/section-header";
import { Button } from "@/components/ui/button";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { safeEval } from "@/lib/safe-eval";

export default function StandardCalculatorPage() {
  const [expr, setExpr] = useState("");
  const [ans, setAns] = useState<string>("");
  const [lastAns, setLastAns] = useState<string>("");

  // "ANS" টোকেনকে runtime এ সংখ্যায় রিপ্লেস করি
  const exprWithAns = useMemo(() => {
    if (!expr) return "";
    if (!lastAns) return expr;
    // শুধুমাত্র ANS শব্দটাকে রিপ্লেস (ভ্যারিয়েবল-সেইফ)
    return expr.replace(/\bANS\b/g, lastAns);
  }, [expr, lastAns]);

  // live preview
  useEffect(() => {
    const v = safeEval(exprWithAns);
    setAns(v == null ? "" : String(v));
  }, [exprWithAns]);

  const push = (t: string) => setExpr((e) => e + t);

  const clear = () => {
    setExpr("");
    setAns("");
  };

  const back = () => setExpr((e) => e.slice(0, -1));

  const equal = () => {
    const v = safeEval(exprWithAns);
    if (v == null) return;
    setExpr(String(v));
    setLastAns(String(v));
    setAns("");
  };

  const copyExpr = async () => {
    try {
      await navigator.clipboard.writeText(expr || "0");
      toast.success("Expression copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  const copyAns = async () => {
    try {
      const v = ans || expr; // preview থাকলে ans, না থাকলে current expr
      if (!v) return;
      await navigator.clipboard.writeText(String(v));
      toast.success("Result copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  const pasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      // হালকা স্যানিটাইজ: অনুমোদিত ক্যারেক্টার ছাড়া বাদ
      const sanitized = text.replace(/[^0-9.+\-*/()% ()A-Z]/gi, "");
      setExpr((e) => e + sanitized);
      toast.success("Pasted!");
    } catch {
      toast.error("Paste failed");
    }
  };

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9.+\-*/()% ]$/.test(k)) setExpr((x) => x + k);
      else if (k === "Enter") equal();
      else if (k === "Backspace") back();
      else if (k.toLowerCase() === "c") clear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <SectionHeader
        title="Standard Calculator"
        desc="Basic arithmetic with glass UI, keyboard support, ANS token, and live preview."
      />

      {/* Quick nav */}
      <div className="mb-1 flex flex-wrap gap-2">
        <Link href="/tools/calc/standard">
          <CalcButton variantIntent="primary" className="px-3">
            <Calculator className="mr-2 h-4 w-4" />
            Standard
          </CalcButton>
        </Link>
        <Link href="/tools/calc/scientific">
          <CalcButton variantIntent="ghost" className="px-3">
            <FunctionSquare className="mr-2 h-4 w-4" />
            Scientific
          </CalcButton>
        </Link>
        <Link href="/tools/calc/percentage">
          <CalcButton variantIntent="ghost" className="px-3">
            <Percent className="mr-2 h-4 w-4" />
            Percentage
          </CalcButton>
        </Link>
      </div>

      <MotionGlassCard className="space-y-4 p-4">
        {/* Flowing action header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Live preview updates as you type. Use <span className="font-mono">ANS</span> to reuse
            last result.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clear} className="gap-2" title="Clear">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={copyExpr} className="gap-2" title="Copy expression">
              <Copy className="h-4 w-4" /> Copy Expr
            </Button>
            <Button
              variant="outline"
              onClick={copyAns}
              className="gap-2"
              title="Copy result/preview"
            >
              <Copy className="h-4 w-4" /> Copy Result
            </Button>
            <Button
              variant="outline"
              onClick={pasteClipboard}
              className="gap-2"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="h-4 w-4" /> Paste
            </Button>
          </div>
        </GlassCard>

        {/* Calculator */}
        <div className="grid grid-cols-4 gap-3">
          {/* Display (spans all columns) */}
          <Display value={expr || "0"} hint={ans ? `= ${ans}` : ""} />

          {/* Top row */}
          <CalcButton
            onClick={clear}
            variantIntent="danger"
            className="col-span-2"
            title="All Clear (C)"
          >
            <Eraser className="mr-2 h-4 w-4" />
            AC
          </CalcButton>
          <CalcButton onClick={back} variantIntent="accent" title="Delete (Backspace)">
            <Delete className="mr-2 h-4 w-4" />
            DEL
          </CalcButton>
          <CalcButton onClick={() => push("/")} variantIntent="accent" title="Divide">
            <Divide className="h-4 w-4" />
          </CalcButton>

          {/* Digits & ops grid */}
          {["7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "(", ")"].map(
            (t, i) => (
              <CalcButton
                key={i}
                onClick={() => push(t)}
                variantIntent={["*", "-", "+"].includes(t) ? "accent" : "ghost"}
                title={t === "*" ? "Multiply" : t}
              >
                {t === "*" ? <X className="h-4 w-4" /> : t}
              </CalcButton>
            ),
          )}

          {/* Bottom row */}
          <CalcButton onClick={() => push("%")} variantIntent="ghost" title="Percent">
            %
          </CalcButton>
          <CalcButton
            onClick={() => push("ANS")}
            onDoubleClick={() => push(lastAns)}
            variantIntent="ghost"
            title="Insert ANS (double-click to insert numeric)"
          >
            ANS
          </CalcButton>
          <CalcButton
            className="col-span-2"
            variantIntent="primary"
            onClick={equal}
            title="Equals (Enter)"
          >
            <Equal className="mr-2 h-4 w-4" />
            Equals
          </CalcButton>
        </div>
      </MotionGlassCard>
    </div>
  );
}
