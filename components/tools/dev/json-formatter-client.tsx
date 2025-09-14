"use client";

import {
  AlignLeft,
  Braces,
  Download,
  FileJson,
  Hash,
  Link2,
  Minimize2,
  RotateCcw,
  Search,
  SortAsc,
  Trash2,
  Type as TypeIcon,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  PasteButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LS_KEY = "toolshub:json-formatter-v1";

export default function JsonFormatterClient() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [indent, setIndent] = useState<IndentOpt>("2");
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [autoOnPaste, setAutoOnPaste] = useState<boolean>(true);

  // Tools tab state
  const [pathQuery, setPathQuery] = useState<string>("");
  const [pathResult, setPathResult] = useState<string>("");

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  /* Persistence */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setInput(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, input);
    } catch {}
  }, [input]);

  // const stats = useMemo(() => {
  //   const lines = input ? input.split(/\n/).length : 0;
  //   const chars = input.length;
  //   return { lines, chars };
  // }, [input]);

  /* Helpers */
  function parseSafe<T = unknown>(text: string): T {
    return JSON.parse(text) as T;
  }

  function sortObjectDeep<T>(value: T): T {
    if (Array.isArray(value)) return value.map(sortObjectDeep) as unknown as T;
    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      entries.sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
      const sorted: Record<string, unknown> = {};
      for (const [k, v] of entries) sorted[k] = sortObjectDeep(v);
      return sorted as unknown as T;
    }
    return value;
  }

  function getIndentValue() {
    return indent === "tab" ? "\t" : Number(indent);
  }

  function readByPath(root: unknown, path: string): unknown {
    if (!path.trim()) return root;

    const tokens: (string | number)[] = [];
    path.replace(/\[(.*?)\]|[^.[\]]+/g, (m, g1) => {
      if (m.startsWith("[")) {
        const key = g1?.trim()?.replace(/^['"]|['"]$/g, "");
        const n = Number(key);
        tokens.push(Number.isFinite(n) && String(n) === key ? n : (key ?? ""));
      } else {
        tokens.push(m);
      }
      return "";
    });

    let cur: unknown = root;
    for (const t of tokens) {
      if (cur == null || (typeof cur !== "object" && !Array.isArray(cur))) return undefined;
      cur = (cur as Record<string | number, unknown>)[t];
    }
    return cur;
  }

  /* Actions */
  function prettify() {
    try {
      const json = parseSafe(input);
      const value = sortKeys ? sortObjectDeep(json) : json;
      const pretty = JSON.stringify(value, null, getIndentValue());
      setOutput(pretty);
      setError("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }

  function minify() {
    try {
      const json = parseSafe(input);
      const value = sortKeys ? sortObjectDeep(json) : json;
      const compact = JSON.stringify(value);
      setOutput(compact);
      setError("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }

  function validate() {
    try {
      parseSafe(input);
      setError("");
      setOutput("✅ Valid JSON");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setError("");
    setPathResult("");
  }

  // Utilities
  function toTypescript() {
    try {
      const json = parseSafe(input);
      const out = jsonToTs("Root", json);
      setOutput(out);
      setError("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }

  function doPathQuery() {
    try {
      const json = parseSafe(input);
      const val = readByPath(json, pathQuery);
      setPathResult(JSON.stringify(val, null, getIndentValue()));
      setError("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setPathResult("");
    }
  }

  function b64Encode() {
    try {
      const buff = new TextEncoder().encode(input);
      const b64 = btoa(String.fromCharCode(...buff));
      setOutput(b64);
      setError("");
    } catch {
      setError("Base64 encode failed");
    }
  }
  function b64Decode() {
    try {
      const str = new TextDecoder().decode(Uint8Array.from(atob(input), (c) => c.charCodeAt(0)));
      setOutput(str);
      setError("");
    } catch {
      setError("Base64 decode failed");
    }
  }

  function urlEncode() {
    setOutput(encodeURIComponent(input));
    setError("");
  }
  function urlDecode() {
    try {
      setOutput(decodeURIComponent(input));
      setError("");
    } catch {
      setError("URL decode failed");
    }
  }
  function escapeStr() {
    setOutput(input.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"'));
    setError("");
  }
  function unescapeStr() {
    setOutput(input.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
    setError("");
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        (document.querySelector("[data-prettify]") as HTMLButtonElement | null)?.click();
      } else if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        (document.querySelector("[data-minify]") as HTMLButtonElement | null)?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider>
      {/* Header */}
      <ToolPageHeader
        icon={FileJson}
        title="JSON Formatter"
        description="Pretty print & validate JSON data"
        actions={
          <>
            {/* Import file */}
            <InputField
              accept="application/json,.json,.txt,text/plain"
              type="file"
              onFilesChange={async (files) => {
                const f = files?.[0];
                if (!f) return;
                const txt = await f.text();
                setInput(txt);
              }}
            />
            {/* Export output or input */}
            <ExportTextButton
              filename="formatted.json"
              getText={() => output || input || "{}"}
              label="Export"
              disabled={!output && !input}
            />
            <ResetButton onClick={clearAll} />
            <CopyButton variant="default" getText={() => output || ""} disabled={!output} />
          </>
        }
      />

      {/* Options */}
      <GlassCard className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
          <CardDescription>Tune formatting and behavior.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <SelectField
            label="Indent"
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
              { value: "tab", label: "Tabs" },
            ]}
            value={indent}
            onValueChange={(v) => setIndent(v as IndentOpt)}
          />
          <SwitchRow
            label="Sort keys"
            hint="Sort object keys alphabetically (deep)."
            checked={sortKeys}
            onCheckedChange={(v) => setSortKeys(Boolean(v))}
          />
          <SwitchRow
            label="Auto-format on paste"
            checked={autoOnPaste}
            onCheckedChange={(v) => setAutoOnPaste(Boolean(v))}
          />
        </CardContent>
      </GlassCard>

      {/* Workbench */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input */}
        <GlassCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Input</CardTitle>
              <div className="flex items-center gap-2">
                <PasteButton
                  size="sm"
                  mode="replace"
                  smartNewline={false}
                  getExisting={() => input}
                  setValue={(next) => {
                    if (autoOnPaste) {
                      try {
                        const json = parseSafe(next);
                        const pretty = JSON.stringify(json, null, getIndentValue());
                        setInput(pretty);
                        setError("");
                        setOutput("");
                        return;
                      } catch {}
                    }
                    setInput(next);
                  }}
                  onText={(raw) => {
                    if (!autoOnPaste) return;
                    try {
                      const json = parseSafe(raw);
                      const pretty = JSON.stringify(json, null, getIndentValue());
                      setInput(pretty);
                      setError("");
                      setOutput("");
                    } catch {
                      setInput(raw);
                    }
                  }}
                />
                <ActionButton
                  size="sm"
                  icon={Trash2}
                  label="Clear"
                  onClick={() => setInput("")}
                  variant="destructive"
                />
              </div>
            </div>
            <CardDescription>
              Paste or type JSON. Strict JSON (no comments or trailing commas).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <TextareaField
              ref={inputRef}
              value={input}
              onValueChange={setInput}
              placeholder='{"hello":"world"}'
              textareaClassName={cn("min-h-[320px] font-mono", error && "border-destructive")}
              onPaste={(e) => {
                if (!autoOnPaste) return;
                const text = e.clipboardData.getData("text");
                if (!text) return;
                try {
                  const json = parseSafe(text);
                  const pretty = JSON.stringify(json, null, getIndentValue());
                  e.preventDefault();
                  setInput(pretty);
                  setError("");
                  setOutput("");
                } catch {
                  // allow normal paste
                }
              }}
            />
            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <div className="font-medium mb-1">Invalid JSON</div>
                <div className="whitespace-pre-wrap break-words">{error}</div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tip: <kbd className="rounded bg-muted px-1">Ctrl</kbd> +{" "}
                <kbd className="rounded bg-muted px-1">Enter</kbd> to prettify •{" "}
                <kbd className="rounded bg-muted px-1">Ctrl</kbd> +{" "}
                <kbd className="rounded bg-muted px-1">M</kbd> to minify
              </p>
            )}
          </CardContent>
          <div className="px-6 pb-6 flex flex-wrap gap-2">
            <ActionButton icon={Wand2} label="Prettify" onClick={prettify} data-prettify />
            <ActionButton
              icon={Minimize2}
              label="Minify"
              onClick={minify}
              variant="secondary"
              data-minify
            />
            <ActionButton icon={AlignLeft} label="Validate" onClick={validate} />
            <ActionButton
              icon={RotateCcw}
              label="Example"
              onClick={() => {
                setOutput("");
                setError("");
                setInput(EXAMPLE_JSON);
              }}
              className="ml-auto"
            />
          </div>
        </GlassCard>

        {/* Output */}
        <GlassCard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Output</CardTitle>
              <div className="flex items-center gap-2">
                <ActionButton
                  icon={SortAsc}
                  label={sortKeys ? "Unsort" : "Sort keys"}
                  onClick={() => setSortKeys((v) => !v)}
                  variant="ghost"
                />
                <CopyButton size="sm" getText={() => output || ""} disabled={!output} />
              </div>
            </div>
            <CardDescription>Formatted/minified JSON or tool results.</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="formatted" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              {/* Formatted */}
              <TabsContent value="formatted">
                <TextareaField
                  readOnly
                  value={output}
                  onValueChange={() => {}}
                  placeholder="Your formatted JSON will appear here"
                  textareaClassName="min-h-[320px] font-mono"
                />
              </TabsContent>

              {/* Raw */}
              <TabsContent value="raw">
                <TextareaField
                  readOnly
                  value={input}
                  onValueChange={() => {}}
                  placeholder="Original input (read-only)"
                  textareaClassName="min-h-[320px] font-mono"
                />
              </TabsContent>

              {/* Tools */}
              <TabsContent value="tools" className="mt-3 space-y-4">
                {/* JSON Path */}
                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Search className="h-4 w-4" /> JSON Path
                    </CardTitle>
                    <CardDescription>
                      Read a value by path (e.g., products[0].title or meta.site).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <InputField
                        value={pathQuery}
                        onChange={(e) => setPathQuery(e.target.value)}
                        placeholder="products[0].title"
                        className="w-full"
                      />
                      <ActionButton icon={Search} label="Query" onClick={doPathQuery} />
                    </div>
                    <TextareaField
                      readOnly
                      value={pathResult}
                      onValueChange={() => {}}
                      placeholder="Result"
                      textareaClassName="min-h-[120px] font-mono"
                    />
                  </CardContent>
                </GlassCard>

                {/* TypeScript */}
                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TypeIcon className="h-4 w-4" /> JSON → TypeScript
                    </CardTitle>
                    <CardDescription>
                      Infer TypeScript interfaces from the current JSON.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ActionButton icon={Braces} label="Generate Types" onClick={toTypescript} />
                    <TextareaField
                      readOnly
                      value={output}
                      onValueChange={() => {}}
                      placeholder="TypeScript output appears in the main Output box"
                      textareaClassName="min-h-[120px] font-mono"
                    />
                  </CardContent>
                </GlassCard>

                {/* Conversions */}
                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hash className="h-4 w-4" /> Base64 / URL / Escapes
                    </CardTitle>
                    <CardDescription>Quick text conversions using the main input.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <ActionButton label="Base64 Encode" onClick={b64Encode} />
                    <ActionButton label="Base64 Decode" onClick={b64Decode} />
                    <ActionButton label="URL Encode" onClick={urlEncode} icon={Link2} />
                    <ActionButton label="URL Decode" onClick={urlDecode} />
                    <ActionButton label="Escape" onClick={escapeStr} />
                    <ActionButton label="Unescape" onClick={unescapeStr} />
                  </CardContent>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </CardContent>

          {/* Output footer */}
          <div className="px-6 pb-6 flex flex-wrap items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Indent: {indent === "tab" ? "tab" : indent} • Sort keys: {String(sortKeys)} •
              Auto-paste: {String(autoOnPaste)}
            </div>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <ExportTextButton
              filename="formatted.json"
              getText={() => output || "{}"}
              label="Download output"
              disabled={!output}
              icon={Download}
            />
          </div>
        </GlassCard>
      </div>
    </TooltipProvider>
  );
}

/* Example JSON */

const EXAMPLE_JSON = `{
  "name": "Tariqul Islam",
  "title": "Full-Stack Developer",
  "skills": ["NextJS", "Express", "MongoDB", "Postgresql", "TypeScript", "Javascript", "Prisma", "Firebase", "Docker"],
  "hardWorker": true,
  "quickLearner": true,
  "problemSolver": true,
  "yearsOfExperience": "1++"
}`;

/* Simple JSON → TS inference */
function jsonToTs(name: string, val: unknown): string {
  const seen = new Map<object, string>();
  const lines: string[] = [];

  function typeOf(
    v: unknown,
  ): "null" | "array" | "object" | "string" | "number" | "boolean" | "unknown" {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    switch (typeof v) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "object":
        return "object";
      default:
        return "unknown";
    }
  }

  function pascal(s: string) {
    return s
      .replace(/(^|[_\-\s]+)([a-z])/g, (_: string, __: string, c: string) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");
  }

  function emitInterface(intName: string, obj: Record<string, unknown>) {
    const keyObj = obj as unknown as object;
    const existing = seen.get(keyObj);
    if (existing) return existing;

    const rows: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k);
      const t = tsFor(v, pascal(k));
      rows.push(`  ${safeKey}: ${t};`);
    }
    const block = `export interface ${intName} {\n${rows.join("\n")}\n}`;
    lines.push(block);
    seen.set(keyObj, intName);
    return intName;
  }

  function tsFor(v: unknown, hint: string): string {
    switch (typeOf(v)) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "null":
        return "null";
      case "array": {
        const arr = v as unknown[];
        if (arr.length === 0) return "unknown[]";
        const types = Array.from(new Set(arr.map((x) => tsFor(x, `${hint}Item`))));
        return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`;
      }
      case "object": {
        const obj = v as Record<string, unknown>;
        const nameHere = pascal(hint || "Object");
        emitInterface(nameHere, obj);
        return nameHere;
      }
      default:
        return "unknown";
    }
  }

  const rootName = pascal(name || "Root");
  const rootType = tsFor(val, rootName);
  if (!lines.find((l) => l.includes(`interface ${rootType} `))) {
    lines.unshift(`export type ${rootName} = ${rootType}`);
  }
  return lines.join("\n\n");
}
