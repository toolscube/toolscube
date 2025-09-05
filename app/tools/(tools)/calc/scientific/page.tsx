"use client";

import {
  Calculator,
  Delete,
  Equal,
  Eraser,
  FunctionSquare,
  Parentheses,
  Percent,
  Pi,
  SquareRadical,
  Superscript,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalcButton } from "@/components/calculators/calc-button";
import { Display } from "@/components/calculators/display";
import { MotionGlassCard } from "@/components/ui/glass-card";
import { safeEval } from "@/lib/safe-eval";

const FNS = [
  { label: "sin", ins: "sin(" },
  { label: "cos", ins: "cos(" },
  { label: "tan", ins: "tan(" },
  { label: "log", ins: "log(" }, // base10
  { label: "ln", ins: "ln(" }, // natural
  { label: "√", ins: "√(" },
];

export default function ScientificCalculatorPage() {
  const [expr, setExpr] = useState("");
  const [ans, setAns] = useState<string>("");
  const [lastAns, setLastAns] = useState<string>("");

  // live preview
  useEffect(() => {
    const v = safeEval(expr);
    setAns(v == null ? "" : String(v));
  }, [expr]);

  const push = (t: string) => setExpr((e) => e + t);
  const clear = () => {
    setExpr("");
    setAns("");
  };
  const back = () => setExpr((e) => e.slice(0, -1));
  const equal = () => {
    const v = safeEval(expr);
    if (v == null) return;
    setExpr(String(v));
    setLastAns(String(v));
    setAns("");
  };

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9.+\-*/()% ]$/.test(k)) setExpr((x) => x + k);
      else if (k === "Enter") equal();
      else if (k === "Backspace") back();
      else if (k.toLowerCase() === "c") clear();
      else if (k.toLowerCase() === "p") push("π");
      else if (k === "^") push("^");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const previewHint = useMemo(() => (ans ? `= ${ans}` : ""), [ans]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* <SectionHeader
        title="Scientific Calculator"
        desc="Trig, logs, powers, roots and constants with a glass UI."
      /> */}

      {/* Quick nav (Standard / Scientific / Percentage) */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href="/tools/calc/standard">
          <CalcButton variantIntent="ghost" className="px-3">
            <Calculator className="mr-2 h-4 w-4" /> Standard
          </CalcButton>
        </Link>
        <Link href="/tools/calc/scientific">
          <CalcButton variantIntent="primary" className="px-3">
            <FunctionSquare className="mr-2 h-4 w-4" /> Scientific
          </CalcButton>
        </Link>
        <Link href="/tools/calc/percentage">
          <CalcButton variantIntent="ghost" className="px-3">
            <Percent className="mr-2 h-4 w-4" /> Percentage
          </CalcButton>
        </Link>
      </div>

      <MotionGlassCard className="p-4">
        {/* Keep 4 cols so existing <Display> fits nicely */}
        <div className="grid grid-cols-4 gap-3">
          {/* Display */}
          <Display value={expr || "0"} hint={previewHint} />

          {/* Function bank — scrollable on mobile, grid on lg */}
          <div className="col-span-4 flex gap-2 overflow-x-auto lg:col-span-4 lg:grid lg:grid-cols-6 lg:gap-3">
            {FNS.map((f) => (
              <CalcButton
                key={f.label}
                onClick={() => push(f.ins)}
                variantIntent="accent"
                className="min-w-[80px] justify-center"
              >
                {f.label === "√" ? <SquareRadical className="h-4 w-4" /> : f.label}
              </CalcButton>
            ))}
          </div>

          {/* Utility row */}
          <CalcButton onClick={() => push("(")} variantIntent="ghost">
            <Parentheses className="h-4 w-4" />
          </CalcButton>
          <CalcButton onClick={() => push(")")} variantIntent="ghost">
            )
          </CalcButton>
          <CalcButton onClick={() => push("π")} variantIntent="ghost">
            <Pi className="h-4 w-4" />
          </CalcButton>
          <CalcButton onClick={() => push("e")} variantIntent="ghost">
            e
          </CalcButton>

          {/* Powers & percent */}
          <CalcButton onClick={() => push("^")} variantIntent="ghost">
            <Superscript className="h-4 w-4" />
          </CalcButton>
          <CalcButton onClick={() => push("^2")} variantIntent="ghost">
            x²
          </CalcButton>
          <CalcButton onClick={() => push("%")} variantIntent="ghost">
            %
          </CalcButton>
          <CalcButton
            onClick={() => push("ANS")}
            variantIntent="ghost"
            onDoubleClick={() => push(lastAns)}
          >
            ANS
          </CalcButton>

          {/* Numbers & ops */}
          {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", "."].map((t, i) => (
            <CalcButton
              key={i}
              onClick={() => push(t)}
              variantIntent={["/", "*", "-"].includes(t) ? "accent" : "ghost"}
            >
              {t}
            </CalcButton>
          ))}
          <CalcButton onClick={() => push("+")} variantIntent="accent">
            +
          </CalcButton>

          {/* Controls */}
          <CalcButton onClick={back} className="col-span-2" variantIntent="accent">
            <Delete className="mr-2 h-4 w-4" /> Back
          </CalcButton>
          <CalcButton onClick={clear} variantIntent="danger">
            <Eraser className="mr-2 h-4 w-4" /> Clear
          </CalcButton>
          <CalcButton onClick={equal} variantIntent="primary">
            <Equal className="mr-2 h-4 w-4" /> Equals
          </CalcButton>
        </div>
      </MotionGlassCard>
    </div>
  );
}
