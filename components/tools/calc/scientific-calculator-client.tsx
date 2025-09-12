"use client";

import {
  Calculator,
  Delete,
  Equal,
  Eraser,
  FunctionSquare,
  Percent,
  Pi,
  Superscript,
  X,
} from "lucide-react";
import * as React from "react";

import { CalcButton } from "@/components/calculators/calc-button";
import { Display } from "@/components/calculators/display";
import {
  ActionButton,
  CopyButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { safeEval } from "@/lib/safe-eval";
import { cn } from "@/lib/utils";

// Function palette
const FNS: Array<{ label: string; ins: string; title?: string }> = [
  { label: "sin", ins: "sin(", title: "Sine" },
  { label: "cos", ins: "cos(", title: "Cosine" },
  { label: "tan", ins: "tan(", title: "Tangent" },
  { label: "log", ins: "log(", title: "Log base 10" },
  { label: "ln", ins: "ln(", title: "Natural log" },
  { label: "√", ins: "√(", title: "Square root" },
];

export default function ScientificCalculatorClient() {
  const [expr, setExpr] = React.useState("");
  const [ans, setAns] = React.useState<string>("");
  const [lastAns, setLastAns] = React.useState<string>("");

  // Replace ANS with last result for preview/evaluate
  const exprWithAns = React.useMemo(() => {
    if (!expr) return "";
    if (!lastAns) return expr;
    return expr.replace(/\bANS\b/g, lastAns);
  }, [expr, lastAns]);

  // Live preview (safeEval should understand sin, cos, tan, log, ln, √, ^, π, etc.)
  React.useEffect(() => {
    const v = safeEval(exprWithAns);
    setAns(v == null ? "" : String(v));
  }, [exprWithAns]);

  // Stable handlers
  const push = React.useCallback((t: string) => {
    setExpr((e) => e + t);
  }, []);

  const resetAll = React.useCallback(() => {
    setExpr("");
    setAns("");
    setLastAns("");
  }, []);

  const clear = React.useCallback(() => {
    setExpr("");
    setAns("");
  }, []);

  const back = React.useCallback(() => {
    setExpr((e) => e.slice(0, -1));
  }, []);

  const equal = React.useCallback(() => {
    const v = safeEval(exprWithAns);
    if (v == null) return;
    const s = String(v);
    setExpr(s);
    setLastAns(s);
    setAns("");
  }, [exprWithAns]);

  // Keyboard support (stable)
  const onKey = React.useCallback(
    (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9.+\-*/()% ]$/.test(k)) {
        setExpr((x) => x + k);
      } else if (k === "Enter") {
        e.preventDefault();
        equal();
      } else if (k === "Backspace") {
        back();
      } else if (k.toLowerCase() === "c") {
        clear();
      } else if (k.toLowerCase() === "p") {
        // quick π
        push("π");
      } else if (k === "^") {
        push("^");
      }
    },
    [equal, back, clear, push],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const previewHint = React.useMemo(() => (ans ? `= ${ans}` : ""), [ans]);

  return (
    <>
      {/* Header with reusable controls */}
      <ToolPageHeader
        icon={FunctionSquare}
        title="Scientific Calculator"
        description="Trig, logs, powers, constants, and ANS."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton icon={Eraser} label="Clear" onClick={clear} />
            <CopyButton label="Copy Expr" getText={() => expr || "0"} />
            <CopyButton
              variant="default"
              label="Copy Result"
              getText={() => (ans || expr || "0").toString()}
            />
          </>
        }
      />

      {/* Quick nav */}
      <GlassCard className="px-4 py-3">
        <div className="mb-1 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <LinkButton size="sm" icon={Calculator} label="Standard" href="/tools/calc/standard" />
            <LinkButton
              size="sm"
              variant="default"
              icon={FunctionSquare}
              label="Scientific"
              href="/tools/calc/scientific"
            />
            <LinkButton size="sm" icon={Percent} label="Percentage" href="/tools/calc/percentage" />
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton size="sm" icon={Delete} label="Back" onClick={back} />
            <ActionButton
              size="sm"
              icon={Calculator}
              variant="default"
              label="Equals"
              onClick={equal}
              aria-label="Equals"
            />
          </div>
        </div>
      </GlassCard>

      <Separator className="my-4" />

      <MotionGlassCard>
        <div className="grid grid-cols-4 gap-3">
          {/* Display */}
          <Display value={expr || "0"} hint={previewHint} />

          <div
            className={cn(
              "col-span-4 flex gap-2 overflow-x-auto pb-1",
              "lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible",
            )}
          >
            {FNS.map((f) => (
              <CalcButton
                key={f.label}
                onClick={() => push(f.ins)}
                variantIntent="accent"
                className="min-w-[80px] justify-center"
                title={f.title ?? f.label}
              >
                {f.label}
              </CalcButton>
            ))}
          </div>

          {/* Utility row */}
          <CalcButton onClick={() => push("(")} variantIntent="ghost" title="(">
            (
          </CalcButton>
          <CalcButton onClick={() => push(")")} variantIntent="ghost" title=")">
            )
          </CalcButton>
          <CalcButton onClick={() => push("π")} variantIntent="ghost" title="Pi (π)">
            <Pi className="h-4 w-4" />
          </CalcButton>
          <CalcButton onClick={() => push("e")} variantIntent="ghost" title="Euler's number (e)">
            e
          </CalcButton>

          {/* Powers & percent */}
          <CalcButton onClick={() => push("^")} variantIntent="ghost" title="Power (^)">
            <Superscript className="h-4 w-4" />
          </CalcButton>
          <CalcButton onClick={() => push("^2")} variantIntent="ghost" title="Square (x²)">
            x²
          </CalcButton>
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

          {/* Digits & ops */}
          {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", "."].map((t, i) => (
            <CalcButton
              key={i as number}
              onClick={() => push(t)}
              variantIntent={["/", "*", "-"].includes(t) ? "accent" : "ghost"}
              title={t === "*" ? "Multiply" : t === "/" ? "Divide" : t}
            >
              {t === "*" ? <X className="h-4 w-4" /> : t}
            </CalcButton>
          ))}
          <CalcButton onClick={() => push("+")} variantIntent="accent" title="Plus">
            +
          </CalcButton>

          {/* Controls */}
          <CalcButton onClick={back} className="col-span-2" variantIntent="accent" title="Back">
            <Delete className="mr-2 h-4 w-4" />
            Back
          </CalcButton>
          <CalcButton onClick={clear} variantIntent="danger" title="Clear">
            <Eraser className="mr-2 h-4 w-4" />
            Clear
          </CalcButton>
          <CalcButton onClick={equal} variantIntent="primary" title="Equals">
            <Equal className="mr-2 h-4 w-4" />
            Equals
          </CalcButton>
        </div>
      </MotionGlassCard>
    </>
  );
}
