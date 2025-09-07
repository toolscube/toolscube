"use client";

import {
  ArrowLeftRight,
  Check,
  Copy,
  Diff as DiffIcon,
  Download,
  Eye,
  EyeOff,
  ListTree,
  RotateCcw,
  Settings2,
} from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";

// Reusables you mentioned

import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types & helpers
// -----------------------------------------------------------------------------

type Granularity = "line" | "word" | "char";
type Op = "equal" | "add" | "remove";

type DiffChunk = {
  op: Op;
  a: string[]; // tokens from A (original)
  b: string[]; // tokens from B (modified)
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const byLines = (s: string) => s.split(/\r?\n/);
const byWords = (s: string) => s.match(/\S+|\s+/g) ?? [];
const byChars = (s: string) => Array.from(s);

// export unified diff text
function buildUnified(chunks: DiffChunk[], context = 3): string {
  const out: string[] = [];
  const linesA: string[] = [];
  const linesB: string[] = [];
  // flatten to lines
  for (const c of chunks) {
    const src = c.op === "remove" || c.op === "equal" ? c.a : [];
    const dst = c.op === "add" || c.op === "equal" ? c.b : [];
    // When tokens are lines already, join directly; for word/char, join then split to lines
    const A = src.join("").split("\n");
    const B = dst.join("").split("\n");
    linesA.push(...A);
    linesB.push(...B);
  }

  // Greedy unified emitter from chunks (respecting context).
  // Simpler version: re-walk chunks and add +/-/space lines with hunk headers.
  let aLine = 1;
  let bLine = 1;
  const pending: string[] = [];

  function flushHunk() {
    if (pending.length === 0) return;
    out.push(
      `@@ -${aLine},${Math.max(0, pending.filter((l) => l.startsWith("-") || l.startsWith(" ")).length)} +${bLine},${Math.max(0, pending.filter((l) => l.startsWith("+") || l.startsWith(" ")).length)} @@`,
    );
    out.push(...pending);
    pending.length = 0;
  }

  let window: { op: Op; lines: string[] }[] = [];
  for (const chunk of chunks) {
    // convert to line arrays for unified view
    const leftLines = chunk.a.join("").split("\n");
    const rightLines = chunk.b.join("").split("\n");

    if (chunk.op === "equal") {
      // If we have an active hunk, keep up to `context` lines, else just move pointers.
      if (window.length) {
        const keep = leftLines.slice(0, context);
        for (const l of keep) {
          pending.push(` ${l}`);
          aLine++;
          bLine++;
        }
        flushHunk();
        // trailing context after hunk
        const tail = leftLines.slice(-context);
        for (const l of tail) {
          pending.push(` ${l}`);
          aLine++;
          bLine++;
        }
        flushHunk();
        // skip middle if long
        const skipped = leftLines.length - (keep.length + tail.length);
        if (skipped > 0) out.push(`… ${skipped} unchanged line${skipped > 1 ? "s" : ""} …`);
        window = [];
      } else {
        aLine += leftLines.length;
        bLine += leftLines.length;
      }
      continue;
    }

    // op is add/remove — open/continue hunk
    window.push({ op: chunk.op, lines: chunk.op === "remove" ? leftLines : rightLines });

    // emit to pending
    if (chunk.op === "remove") {
      for (const l of leftLines) {
        pending.push(`-${l}`);
        aLine++;
      }
    } else {
      for (const l of rightLines) {
        pending.push(`+${l}`);
        bLine++;
      }
    }
  }
  flushHunk();
  return out.join("\n");
}

// LCS diff (token-based)
function diffTokens(a: string[], b: string[]): DiffChunk[] {
  const n = a.length;
  const m = b.length;
  // Guard very long input for char-level
  if (n * m > 1_200_000) {
    // fallback: trivial all-removed/all-added
    return [
      ...(n ? [{ op: "remove" as Op, a, b: [] }] : []),
      ...(m ? [{ op: "add" as Op, a: [], b }] : []),
    ];
  }

  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // backtrack
  const out: DiffChunk[] = [];
  let i = 0,
    j = 0;
  const push = (op: Op, aa: string[], bb: string[]) => {
    if (aa.length === 0 && bb.length === 0) return;
    const last = out[out.length - 1];
    if (last && last.op === op) {
      last.a.push(...aa);
      last.b.push(...bb);
    } else {
      out.push({ op, a: aa.slice(), b: bb.slice() });
    }
  };

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("equal", [a[i++]], [b[j++]]);
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push("remove", [a[i++]], []);
    } else {
      push("add", [], [b[j++]]);
    }
  }
  while (i < n) push("remove", [a[i++]], []);
  while (j < m) push("add", [], [b[j++]]);
  return out;
}

// Tokenizers per granularity
function tokenize(text: string, mode: Granularity) {
  switch (mode) {
    case "line":
      return byLines(text);
    case "word":
      return byWords(text);
    case "char":
    default:
      return byChars(text);
  }
}

function normalize(text: string, opts: { ignoreCase: boolean; ignoreWs: boolean }) {
  let s = text;
  if (opts.ignoreCase) s = s.toLowerCase();
  if (opts.ignoreWs) s = s.replace(/[ \t]+/g, " ").trim();
  return s;
}

// Highlight same-line inner changes (char diff) for split view
function inlineDiff(a: string, b: string) {
  const A = Array.from(a);
  const B = Array.from(b);
  const chunks = diffTokens(A, B);
  const left: React.ReactNode[] = [];
  const right: React.ReactNode[] = [];
  for (const c of chunks) {
    if (c.op === "equal") {
      left.push(<span key={`l${left.length}`}>{c.a.join("")}</span>);
      right.push(<span key={`r${right.length}`}>{c.b.join("")}</span>);
    } else if (c.op === "remove") {
      left.push(
        <span key={`l${left.length}`} className="bg-destructive/20 text-destructive">
          {c.a.join("")}
        </span>,
      );
    } else if (c.op === "add") {
      right.push(
        <span key={`r${right.length}`} className="bg-emerald-500/15 text-emerald-500">
          {c.b.join("")}
        </span>,
      );
    }
  }
  return { left, right };
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function DiffCheckerPage() {
  const [a, setA] = React.useState<string>("");
  const [b, setB] = React.useState<string>("");
  const [granularity, setGranularity] = React.useState<Granularity>("line");
  const [ignoreCase, setIgnoreCase] = React.useState<boolean>(false);
  const [ignoreWs, setIgnoreWs] = React.useState<boolean>(false);
  const [collapse, setCollapse] = React.useState<boolean>(true);
  const [context, setContext] = React.useState<number>(3);
  const [showLineNos, setShowLineNos] = React.useState<boolean>(true);
  const [auto, setAuto] = React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<"split" | "unified" | "stats">("split");
  const [copied, setCopied] = React.useState<string | null>(null);

  const compute = React.useCallback(() => {
    const A = normalize(a, { ignoreCase, ignoreWs });
    const B = normalize(b, { ignoreCase, ignoreWs });
    const tA = tokenize(A, granularity);
    const tB = tokenize(B, granularity);
    return diffTokens(tA, tB);
  }, [a, b, granularity, ignoreCase, ignoreWs]);

  const chunks = React.useMemo(() => compute(), [compute, auto]); // recompute if auto toggled (first render still runs)

  const unified = React.useMemo(
    () => buildUnified(chunks, clamp(context, 0, 20)),
    [chunks, context],
  );

  const stats = React.useMemo(() => {
    let adds = 0,
      dels = 0,
      equals = 0;
    for (const c of chunks) {
      if (c.op === "add") adds += c.b.length;
      else if (c.op === "remove") dels += c.a.length;
      else equals += c.a.length;
    }
    return { adds, dels, equals, total: adds + dels + equals };
  }, [chunks]);

  const swap = () => {
    setA(b);
    setB(a);
  };

  const copyUnified = async () => {
    await navigator.clipboard.writeText(unified);
    setCopied("unified");
    setTimeout(() => setCopied(null), 1000);
  };

  const downloadPatch = () => {
    const blob = new Blob([unified], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement("a");
    aEl.href = url;
    aEl.download = "diff.patch";
    document.body.appendChild(aEl);
    aEl.click();
    aEl.remove();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setA("");
    setB("");
    setGranularity("line");
    setIgnoreCase(false);
    setIgnoreWs(false);
    setCollapse(true);
    setContext(3);
    setShowLineNos(true);
    setActiveTab("split");
  };

  return (
    <MotionGlassCard className="p-4 md:p-6 lg:p-8">
      <ToolPageHeader
        title="Diff Checker"
        description="Compare text inputs and see differences in split or unified view."
        icon={DiffIcon}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={swap} icon={ArrowLeftRight} label="Swap" />
            <CopyButton
              onClick={copyUnified}
              icon={Copy}
              active={copied === "unified"}
              tooltip="Copy unified diff"
              label="Copy Diff"
            />
            <ExportTextButton
              icon={Download}
              filename="diff.patch"
              getText={() => unified}
              label=".patch"
            />
            <ResetButton onClick={resetAll} icon={RotateCcw} />
          </div>
        }
      />

      {/* Inputs */}
      <GlassCard className="shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextareaField
            id="original"
            label="Original (A)"
            placeholder="Paste or type the original text here…"
            value={a}
            onChange={(e) => setA(e.target.value)}
            autoResize
            className="min-h-[220px]"
          />
          <TextareaField
            id="modified"
            label="Modified (B)"
            placeholder="Paste or type the modified text here…"
            value={b}
            onChange={(e) => setB(e.target.value)}
            autoResize
            className="min-h-[220px]"
          />
        </div>

        <Separator className="my-4" />

        {/* Settings */}
        <div className="grid gap-4 lg:grid-cols-3">
          <GlassCard className="p-3">
            <div className="mb-2 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <div className="text-sm font-medium">Options</div>
            </div>
            <div className="grid gap-2">
              <SelectField
                id="granularity"
                label="Granularity"
                value={granularity}
                onValueChange={(v) => setGranularity(v as Granularity)}
                options={[
                  { label: "Line", value: "line" },
                  { label: "Word", value: "word" },
                  { label: "Character", value: "char" },
                ]}
              />
              <SwitchRow label="Ignore case" checked={ignoreCase} onCheckedChange={setIgnoreCase} />
              <SwitchRow
                label="Ignore extra spaces"
                checked={ignoreWs}
                onCheckedChange={setIgnoreWs}
              />
              <SwitchRow label="Auto update" checked={auto} onCheckedChange={setAuto} />
            </div>
          </GlassCard>

          <GlassCard className="p-3">
            <div className="mb-2 flex items-center gap-2">
              <ListTree className="h-4 w-4" />
              <div className="text-sm font-medium">Viewer</div>
            </div>
            <div className="grid gap-2">
              <SwitchRow
                label="Collapse unchanged"
                checked={collapse}
                onCheckedChange={setCollapse}
              />
              <InputField
                id="context"
                type="number"
                label="Context lines"
                min={0}
                max={50}
                value={String(context)}
                onChange={(e) => setContext(clamp(Number(e.target.value) || 0, 0, 50))}
              />
              <SwitchRow
                label="Show line numbers (split)"
                checked={showLineNos}
                onCheckedChange={setShowLineNos}
              />
            </div>
          </GlassCard>

          <GlassCard className="p-3">
            <div className="mb-2 text-sm font-medium">Summary</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatPill label="Added" value={stats.adds} tone="add" />
              <StatPill label="Removed" value={stats.dels} tone="remove" />
              <StatPill label="Unchanged" value={stats.equals} tone="muted" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Total tokens: <b>{stats.total}</b> • Mode: <b>{granularity}</b>
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      <Separator className="my-6" />

      {/* Results */}
      <GlassCard className="shadow-sm">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
            <TabsList className="flex-1">
              <TabsTrigger value="split">Split</TabsTrigger>
              <TabsTrigger value="unified">Unified</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <ActionButton label="Download .patch" onClick={downloadPatch} icon={Download} />
            </div>
          </div>

          <TabsContent value="split" className="p-3">
            <SplitView
              a={a}
              b={b}
              chunks={chunks}
              collapse={collapse}
              context={context}
              showLineNos={showLineNos}
            />
          </TabsContent>

          <TabsContent value="unified" className="p-3">
            <pre className="max-h-[520px] overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
              {unified || "—"}
            </pre>
          </TabsContent>

          <TabsContent value="stats" className="p-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Kpi label="Added" value={stats.adds} />
              <Kpi label="Removed" value={stats.dels} />
              <Kpi label="Unchanged" value={stats.equals} />
            </div>
            <div className="mt-3 rounded-md border p-3 text-xs text-muted-foreground">
              The diff is computed with an LCS (Longest Common Subsequence) over the chosen
              granularity (line/word/char). For long inputs, we guard against pathological
              time/space by falling back to a trivial hunk.
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>
    </MotionGlassCard>
  );
}

// -----------------------------------------------------------------------------
// Split view renderer
// -----------------------------------------------------------------------------

function SplitView({
  a,
  b,
  chunks,
  collapse,
  context,
  showLineNos,
}: {
  a: string;
  b: string;
  chunks: DiffChunk[];
  collapse: boolean;
  context: number;
  showLineNos: boolean;
}) {
  // Render on a line basis for readability
  const rows: Array<{
    left?: string;
    right?: string;
    type: "equal" | "add" | "remove";
  }> = [];

  for (const c of chunks) {
    const leftLines = c.op === "add" ? [] : c.a.join("").split("\n");
    const rightLines = c.op === "remove" ? [] : c.b.join("").split("\n");

    if (c.op === "equal") {
      const L = Math.max(leftLines.length, rightLines.length);
      for (let i = 0; i < L; i++) {
        rows.push({ left: leftLines[i] ?? "", right: rightLines[i] ?? "", type: "equal" });
      }
    } else if (c.op === "remove") {
      for (const l of leftLines) rows.push({ left: l, type: "remove" });
    } else {
      for (const r of rightLines) rows.push({ right: r, type: "add" });
    }
  }

  // Collapse unchanged blocks with context lines
  const finalRows: typeof rows = [];
  if (collapse) {
    let i = 0;
    while (i < rows.length) {
      if (rows[i].type !== "equal") {
        finalRows.push(rows[i++]);
        continue;
      }
      // accumulate contiguous equals
      const start = i;
      while (i < rows.length && rows[i].type === "equal") i++;
      const end = i;
      const len = end - start;
      if (len > context * 2 + 1) {
        // head context
        for (let k = 0; k < context; k++) finalRows.push(rows[start + k]);
        finalRows.push({ type: "equal", left: `… ${len - context * 2} unchanged lines …` });
        // tail context
        for (let k = end - context; k < end; k++) finalRows.push(rows[k]);
      } else {
        for (let k = start; k < end; k++) finalRows.push(rows[k]);
      }
    }
  } else {
    finalRows.push(...rows);
  }

  // line numbers
  let ln = 1;
  let rn = 1;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="rounded-md border">
        <Header label="Original (A)" />
        <div className="max-h-[520px] overflow-auto p-2 text-sm leading-relaxed">
          {finalRows.map((r, i) => {
            const isBlank = r.left == null;
            const lineNo =
              r.type === "remove" || r.type === "equal" ? (
                <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                  {r.left != null && showLineNos ? ln : ""}
                </span>
              ) : (
                <span className="w-10 shrink-0" />
              );

            // inline highlight for changed counterparts
            const content =
              r.type === "equal" ? (
                <span>{r.left ?? ""}</span>
              ) : r.type === "remove" ? (
                <span className="bg-destructive/15 text-destructive">{r.left ?? ""}</span>
              ) : (
                // add only shows on right column
                <span className="opacity-50">{r.left ?? ""}</span>
              );

            const rowEl = (
              <div
                key={`l${i}`}
                className={cn(
                  "flex items-start gap-2 whitespace-pre-wrap break-words border-b px-2 py-1",
                  r.type === "remove" && "bg-destructive/10",
                  r.type === "equal" && "bg-transparent",
                )}
              >
                {lineNo}
                <div className="min-w-0 flex-1 font-mono">{content}</div>
              </div>
            );

            if (r.left != null && (r.type === "equal" || r.type === "remove")) ln++;
            return rowEl;
          })}
        </div>
      </div>

      <div className="rounded-md border">
        <Header label="Modified (B)" />
        <div className="max-h-[520px] overflow-auto p-2 text-sm leading-relaxed">
          {finalRows.map((r, i) => {
            const lineNo =
              r.type === "add" || r.type === "equal" ? (
                <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                  {r.right != null && showLineNos ? rn : ""}
                </span>
              ) : (
                <span className="w-10 shrink-0" />
              );

            let content: React.ReactNode;
            if (r.type === "equal") {
              content = <span>{r.right ?? ""}</span>;
            } else if (r.type === "add") {
              content = <span className="bg-emerald-500/15 text-emerald-600">{r.right ?? ""}</span>;
            } else {
              content = <span className="opacity-50">{r.right ?? ""}</span>;
            }

            const rowEl = (
              <div
                key={`r${i}`}
                className={cn(
                  "flex items-start gap-2 whitespace-pre-wrap break-words border-b px-2 py-1",
                  r.type === "add" && "bg-emerald-500/10",
                  r.type === "equal" && "bg-transparent",
                )}
              >
                {lineNo}
                <div className="min-w-0 flex-1 font-mono">{content}</div>
              </div>
            );
            if (r.right != null && (r.type === "equal" || r.type === "add")) rn++;
            return rowEl;
          })}
        </div>
      </div>
    </div>
  );
}

function Header({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
      <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
        {label}
      </div>
      <Badge variant="outline" className="text-[10px]">
        Monospace view
      </Badge>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Small UI bits (reuse-friendly)
// -----------------------------------------------------------------------------

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "add" | "remove" | "muted";
}) {
  const toneClass =
    tone === "add"
      ? "bg-emerald-500/15 text-emerald-600"
      : tone === "remove"
        ? "bg-destructive/15 text-destructive"
        : "bg-muted/50 text-muted-foreground";
  return (
    <div className={cn("rounded-md px-3 py-2 text-center", toneClass)}>
      <div className="text-xs">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
