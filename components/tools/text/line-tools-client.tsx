"use client";

import {
  Filter,
  Hash,
  List,
  ListOrdered,
  Replace,
  Scissors,
  Search,
  Shuffle,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { normalizeEOL } from "@/lib/utils";

const LS_KEY = "toolscube:line-tools-v1";

/* Utilities */
function splitLines(s: string) {
  if (!s) return [] as string[];
  return normalizeEOL(s).split("\n");
}

function joinLines(lines: string[]) {
  return lines.join("\n");
}

export default function LineToolsClient() {
  const [text, setText] = useState("");
  const [resultLines, setResultLines] = useState<string[]>([]);
  const [keepOrder, setKeepOrder] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [trimEach, setTrimEach] = useState(true);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterRegex, setFilterRegex] = useState(false);
  const [filterMode, setFilterMode] = useState<"keep" | "remove">("keep");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [numbering, setNumbering] = useState(false);
  const [startNum, setStartNum] = useState(1);
  const [numSep, setNumSep] = useState(". ");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setText(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, text);
    } catch {}
  }, [text]);

  /* Derived data */
  const lines = useMemo(() => {
    let l = splitLines(text);
    if (trimEach) l = l.map((x) => x.trim());
    if (removeEmpty) l = l.filter((x) => x.length > 0);
    return l;
  }, [text, trimEach, removeEmpty]);

  const stats = useMemo(() => {
    const total = splitLines(text).length;
    const empty = splitLines(text).filter((x) => x.trim() === "").length;
    const uniqSet = new Set(lines.map((x) => (caseSensitive ? x : x.toLowerCase())));
    const avgLen = lines.length ? Math.round(lines.join("").length / lines.length) : 0;
    return { total, nonEmpty: total - empty, empty, unique: uniqSet.size, avgLen };
  }, [text, lines, caseSensitive]);

  const output = useMemo(() => {
    const base = resultLines.length > 0 ? resultLines : lines;
    if (base.length === 0) return "";
    return joinLines(
      base.map((line, i) => {
        const n = numbering ? `${startNum + i}${numSep}` : "";
        return `${n}${prefix}${line}${suffix}`;
      }),
    );
  }, [resultLines, lines, numbering, startNum, numSep, prefix, suffix]);

  /* Actions */
  function actionSort(dir: "asc" | "desc") {
    const key = (s: string) => (caseSensitive ? s : s.toLowerCase());
    const sorted = [...lines].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    if (dir === "desc") sorted.reverse();
    setResultLines(sorted);
  }

  function actionShuffle() {
    const arr = [...lines];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setResultLines(arr);
  }

  function actionUnique() {
    const seen = new Set<string>();
    const arr: string[] = [];
    for (const line of lines) {
      const k = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        arr.push(line);
      }
    }
    if (!keepOrder) arr.sort((a, b) => a.localeCompare(b));
    setResultLines(arr);
  }

  function actionTrim() {
    const l = splitLines(text).map((x) => x.trim());
    setResultLines(l.filter((x) => (removeEmpty ? x.length > 0 : true)));
  }

  function actionFindReplace() {
    const src = splitLines(text);
    let pattern: RegExp | null = null;
    if (useRegex) {
      try {
        pattern = new RegExp(find, caseSensitive ? "g" : "gi");
      } catch {
        return;
      }
    }
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re =
      pattern ||
      new RegExp(wholeWord ? `\\b${esc(find)}\\b` : esc(find), caseSensitive ? "g" : "gi");
    const out = src.map((line) => line.replace(re, replace));
    setResultLines(out);
  }

  function actionFilter() {
    const src = [...lines];
    let re: RegExp | null = null;
    if (filterRegex) {
      try {
        re = new RegExp(filterQuery, caseSensitive ? "" : "i");
      } catch {
        return;
      }
    }
    const contains = (s: string) =>
      re
        ? re.test(s)
        : caseSensitive
          ? s.includes(filterQuery)
          : s.toLowerCase().includes(filterQuery.toLowerCase());
    const out = src.filter((l) => (filterMode === "keep" ? contains(l) : !contains(l)));
    setResultLines(out);
  }

  function resetAll() {
    setText("");
    setResultLines([]);
    setKeepOrder(true);
    setCaseSensitive(false);
    setRemoveEmpty(true);
    setTrimEach(true);
    setFind("");
    setReplace("");
    setUseRegex(false);
    setWholeWord(false);
    setFilterQuery("");
    setFilterRegex(false);
    setFilterMode("keep");
    setPrefix("");
    setSuffix("");
    setNumbering(false);
    setStartNum(1);
    setNumSep(". ");
  }

  const inputHistory = [
    { label: "Total", value: stats.total },
    { label: "Non-empty", value: stats.nonEmpty },
    { label: "Empty", value: stats.empty },
    { label: "Unique", value: stats.unique },
    { label: "Avg length", value: stats.avgLen },
  ];

  const actions = [
    {
      icon: SortAsc,
      label: "Sort A→Z",
      onClick: () => actionSort("asc"),
    },
    {
      icon: SortDesc,
      label: "Sort Z→A",
      onClick: () => actionSort("desc"),
    },
    {
      icon: Shuffle,
      label: "Shuffle",
      onClick: actionShuffle,
    },
    {
      icon: Hash,
      label: "Unique",
      onClick: actionUnique,
    },
    {
      icon: Scissors,
      label: "Trim lines",
      onClick: actionTrim,
    },
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={List}
        title="Line Tools"
        description="Sort, dedupe, trim, find & replace, filter, shuffle, and format lines fast."
        actions={
          <>
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
              variant="outline"
              filename="text.txt"
              getText={() => text}
              label="Export"
              disabled={!text}
            />
            <ResetButton onClick={resetAll} />
            <CopyButton
              variant="default"
              getText={() => output || text || ""}
              disabled={!text && !output}
            />
          </>
        }
      />

      {/* Input */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
          <CardDescription>
            Paste or type your lines below. We can trim and remove empty lines automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <TextareaField
            textareaClassName="min-h-[220px]"
            placeholder={`orange\napple\nBanana\nbanana  \n  grape\n\npear`}
            value={text}
            onValueChange={setText}
          />

          <div className="grid gap-3 sm:grid-cols-4">
            <SwitchRow
              label="Trim each line"
              hint="Remove leading & trailing spaces."
              checked={trimEach}
              onCheckedChange={(v) => setTrimEach(Boolean(v))}
            />
            <SwitchRow
              label="Remove empty lines"
              hint="Ignore blank lines in processing."
              checked={removeEmpty}
              onCheckedChange={(v) => setRemoveEmpty(Boolean(v))}
            />
            <SwitchRow
              label="Case sensitive"
              hint="Affects sort & dedupe."
              checked={caseSensitive}
              onCheckedChange={(v) => setCaseSensitive(Boolean(v))}
            />
            <SwitchRow
              label="Keep order on dedupe"
              hint="Preserve first occurrence."
              checked={keepOrder}
              onCheckedChange={(v) => setKeepOrder(Boolean(v))}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted-foreground">
            {inputHistory.map((h, idx) => (
              <div key={idx as number} className="rounded-md border p-2">
                {h.label}: <strong>{h.value}</strong>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Operations */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Operations</CardTitle>
          <CardDescription>
            Run one action at a time—result appears below. Prefix/suffix/numbering update live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic ops */}
          <div className="flex flex-wrap gap-2">
            {actions.map((a, i) => (
              <ActionButton
                key={i as number}
                icon={a.icon}
                label={a.label}
                onClick={a.onClick}
                variant="outline"
              />
            ))}
          </div>

          {/* Find & Replace */}
          <div className="rounded-md border">
            <div className="px-3 py-2 border-b flex items-center gap-2 text-sm font-medium">
              <Replace className="h-4 w-4" /> Find & Replace
            </div>
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              <InputField
                label="Find"
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder={useRegex ? "regex e.g. ^foo" : "text"}
              />
              <InputField
                label="Replace"
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="with..."
              />
              <div className="flex items-center gap-4">
                <SwitchRow
                  label="Regex"
                  checked={useRegex}
                  onCheckedChange={(v) => setUseRegex(Boolean(v))}
                />
                <SwitchRow
                  label="Whole word"
                  checked={wholeWord}
                  onCheckedChange={(v) => setWholeWord(Boolean(v))}
                  disabled={useRegex}
                />
              </div>
              <div className="flex justify-end">
                <ActionButton
                  icon={Search}
                  label="Run Replace"
                  onClick={actionFindReplace}
                  disabled={!find}
                />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="rounded-md border">
            <div className="px-3 py-2 border-b text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter lines
            </div>
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              <InputField
                label="Query"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={filterRegex ? "regex e.g. \\d{3}" : "contains..."}
              />
              <div className="grid grid-cols-2 gap-2 items-end">
                <SwitchRow
                  label="Regex"
                  checked={filterRegex}
                  onCheckedChange={(v) => setFilterRegex(Boolean(v))}
                />
                <SelectField
                  options={[
                    { value: "keep", label: "Keep matches" },
                    { value: "remove", label: "Remove matches" },
                  ]}
                  value={filterMode}
                  onValueChange={(v) => setFilterMode(v as "keep" | "remove")}
                  placeholder="Action"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <ActionButton
                  icon={Filter}
                  label="Apply Filter"
                  onClick={actionFilter}
                  disabled={!filterQuery}
                />
              </div>
            </div>
          </div>

          {/* Prefix / Suffix / Numbering — LIVE */}
          <div className="rounded-md border">
            <div className="px-3 py-2 border-b text-sm font-medium flex items-center gap-2">
              <ListOrdered className="h-4 w-4" /> Prefix / Suffix / Numbering
            </div>
            <div className="p-3 grid gap-3 sm:grid-cols-2">
              <InputField
                label="Prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. - "
              />
              <InputField
                label="Suffix"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="e.g. ;"
              />
              <div className="grid sm:grid-cols-2 gap-2 items-end">
                <SwitchRow
                  label="Enable numbering"
                  checked={numbering}
                  onCheckedChange={(v) => setNumbering(Boolean(v))}
                />
                <InputField
                  label="Start number"
                  type="number"
                  value={String(startNum)}
                  onChange={(e) => setStartNum(Number(e.target.value) || 1)}
                  disabled={!numbering}
                />
              </div>
              <InputField
                label="Number separator"
                value={numSep}
                onChange={(e) => setNumSep(e.target.value)}
                disabled={!numbering}
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Output */}
      <GlassCard>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Output</CardTitle>
              <Badge variant="secondary">Live</Badge>
            </div>
            <CardDescription>Result of the last action with live affixes applied.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <TextareaField
            readOnly
            value={output}
            onValueChange={() => {}}
            textareaClassName="min-h-[200px] font-mono"
            placeholder="Run an operation to see results here..."
          />
          <div className="flex flex-wrap gap-2">
            <ExportTextButton
              variant="default"
              filename="lines-output.txt"
              getText={() => output}
              disabled={!output}
            />
            <CopyButton
              getText={() => output || ""}
              disabled={!output}
              label="Copy Output"
              copiedLabel="Copied Output"
            />
            <ActionButton
              icon={Replace}
              label="Replace Input"
              onClick={() => setText(output)}
              disabled={!output}
            />
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
