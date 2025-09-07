"use client";

import {
  Check,
  Copy,
  Download,
  Fullscreen,
  Hash,
  Key,
  ListChecks,
  Minimize2,
  RefreshCw,
  RotateCcw,
  Settings2,
  Shuffle,
  Type as TypeIcon,
  Upload,
  Wand2,
} from "lucide-react";
import { customAlphabet, nanoid as nanoidFn } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import * as uuid from "uuid";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------------------------- constants ------------------------------- */

const STORAGE_KEY = "toolshub.uuid-nanoid.v1";

type Mode = "uuid" | "nanoid";
export type UuidVersion = "v1" | "v4" | "v5" | "v7";

const DEFAULT_NANO_ALPHABET = "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PRESETS: Record<string, string> = {
  "URL-safe (default)": DEFAULT_NANO_ALPHABET,
  Alphanumeric: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "Hex (lowercase)": "0123456789abcdef",
  "HEX (uppercase)": "0123456789ABCDEF",
  "Numbers only": "0123456789",
};

/* -------------------------------- helpers --------------------------------- */
function clsx(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(" ");
}
function deEscapeDelimiter(s: string) {
  return s.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clampInt(v: string, min: number, max: number) {
  const n = parseInt(v.replace(/[^\d-]/g, ""), 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/* ---------------------------------- page ---------------------------------- */

export default function UuidNanoidClient() {
  const [mode, setMode] = useState<Mode>("uuid");

  // shared
  const [count, setCount] = useState<number>(10);
  const [uniqueOnly, setUniqueOnly] = useState<boolean>(true);
  const [prefix, setPrefix] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>("\\n");
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  // uuid
  const [uuidVersion, setUuidVersion] = useState<UuidVersion>("v4");
  const [uuidUpper, setUuidUpper] = useState<boolean>(false);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidBraces, setUuidBraces] = useState<boolean>(false);
  const [v5NamespacePreset, setV5NamespacePreset] = useState<"URL" | "DNS" | "Custom">("URL");
  const [v5Namespace, setV5Namespace] = useState<string>("");
  const [v5Name, setV5Name] = useState<string>("");

  // nanoid
  const [nanoSize, setNanoSize] = useState<number>(21);
  const [nanoAlphabet, setNanoAlphabet] = useState<string>(DEFAULT_NANO_ALPHABET);
  const [nanoPreset, setNanoPreset] = useState<string>("URL-safe (default)");

  // output + state
  const [list, setList] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | "ALL" | null>(null);
  const [filename, setFilename] = useState<string>("ids.txt");
  const [validationInput, setValidationInput] = useState<string>("");
  const [errors, setErrors] = useState<string | null>(null);

  // restore persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      setMode((s.mode as Mode) ?? "uuid");
      setCount(Number.isFinite(s.count) ? s.count : 10);
      setUniqueOnly(Boolean(s.uniqueOnly ?? true));
      setPrefix(String(s.prefix ?? ""));
      setSuffix(String(s.suffix ?? ""));
      setDelimiter(String(s.delimiter ?? "\\n"));
      setUuidVersion((s.uuidVersion as UuidVersion) ?? "v4");
      setUuidUpper(Boolean(s.uuidUpper ?? false));
      setUuidHyphens(Boolean(s.uuidHyphens ?? true));
      setUuidBraces(Boolean(s.uuidBraces ?? false));
      setV5NamespacePreset((s.v5NamespacePreset as "URL" | "DNS" | "Custom") ?? "URL");
      setV5Namespace(String(s.v5Namespace ?? ""));
      setV5Name(String(s.v5Name ?? ""));
      setNanoSize(Number.isFinite(s.nanoSize) ? s.nanoSize : 21);
      setNanoAlphabet(String(s.nanoAlphabet ?? DEFAULT_NANO_ALPHABET));
      setNanoPreset(String(s.nanoPreset ?? "URL-safe (default)"));
      setFilename(String(s.filename ?? "ids.txt"));
    } catch {
      /* ignore */
    }
  }, []);

  // persist (debounced)
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            mode,
            count,
            uniqueOnly,
            prefix,
            suffix,
            delimiter,
            uuidVersion,
            uuidUpper,
            uuidHyphens,
            uuidBraces,
            v5NamespacePreset,
            v5Namespace,
            v5Name,
            nanoSize,
            nanoAlphabet,
            nanoPreset,
            filename,
          }),
        );
      } catch {
        /* ignore */
      }
    }, 180);
    return () => window.clearTimeout(t);
  }, [
    mode,
    count,
    uniqueOnly,
    prefix,
    suffix,
    delimiter,
    uuidVersion,
    uuidUpper,
    uuidHyphens,
    uuidBraces,
    v5NamespacePreset,
    v5Namespace,
    v5Name,
    nanoSize,
    nanoAlphabet,
    nanoPreset,
    filename,
  ]);

  const entropyBits = useMemo(() => {
    if (mode === "uuid") {
      if (uuidVersion === "v5") return 0; // deterministic hash
      return 122; // effective randomness for v1/v4/v7
    }
    const L = Math.max(1, nanoAlphabet.length);
    const bits = nanoSize * Math.log2(L);
    return Math.round(bits);
  }, [mode, uuidVersion, nanoAlphabet, nanoSize]);

  /* ------------------------------- generation ------------------------------ */

  const formatUuid = (id: string) => {
    let s = id;
    if (!uuidHyphens) s = s.replace(/-/g, "");
    if (uuidUpper) s = s.toUpperCase();
    if (uuidBraces) s = `{${s}}`;
    if (prefix) s = `${prefix}${s}`;
    if (suffix) s = `${s}${suffix}`;
    return s;
  };

  const genUuidOnce = (): string => {
    switch (uuidVersion) {
      case "v1":
        return formatUuid(uuid.v1());
      case "v5": {
        const ns =
          v5NamespacePreset === "URL"
            ? uuid.v5.URL
            : v5NamespacePreset === "DNS"
              ? uuid.v5.DNS
              : v5Namespace;
        if (!ns || !uuid.validate(ns)) {
          throw new Error("UUID v5 requires a valid namespace UUID (URL/DNS preset or custom).");
        }
        if (!v5Name) {
          throw new Error('UUID v5 requires a "Name" string.');
        }
        return formatUuid(uuid.v5(v5Name, ns));
      }
      case "v7": {
        const v7 = (uuid as unknown as { v7?: () => string }).v7;
        return formatUuid(typeof v7 === "function" ? v7() : uuid.v4());
      }
      case "v4":
      default:
        return formatUuid(uuid.v4());
    }
  };

  const genNanoOnce = (): string => {
    const core =
      nanoAlphabet === DEFAULT_NANO_ALPHABET
        ? nanoidFn(nanoSize)
        : customAlphabet(nanoAlphabet, nanoSize)();
    return `${prefix}${core}${suffix}`;
  };

  const run = () => {
    try {
      setErrors(null);
      const out: string[] = [];
      const seen = new Set<string>();
      const target = Math.max(1, Math.min(1000, count));
      let attempts = 0;
      while (out.length < target && attempts < target * 20) {
        attempts += 1;
        const next = mode === "uuid" ? genUuidOnce() : genNanoOnce();
        if (uniqueOnly) {
          if (seen.has(next)) continue;
          seen.add(next);
        }
        out.push(next);
      }
      setList(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrors(msg);
      setList([]);
    }
  };

  const resetAll = () => {
    setMode("uuid");
    setCount(10);
    setUniqueOnly(true);
    setPrefix("");
    setSuffix("");
    setDelimiter("\\n");
    setUuidVersion("v4");
    setUuidUpper(false);
    setUuidHyphens(true);
    setUuidBraces(false);
    setV5NamespacePreset("URL");
    setV5Namespace("");
    setV5Name("");
    setNanoSize(21);
    setNanoAlphabet(DEFAULT_NANO_ALPHABET);
    setNanoPreset("URL-safe (default)");
    setFilename("ids.txt");
    setList([]);
    setErrors(null);
  };

  const copyOne = async (s: string) => {
    try {
      await navigator.clipboard.writeText(s);
      setCopied(s);
      window.setTimeout(() => setCopied(null), 900);
    } catch {
      /* ignore */
    }
  };

  const copyAll = async () => {
    try {
      const delim = deEscapeDelimiter(delimiter || "\n");
      await navigator.clipboard.writeText(list.join(delim));
      setCopied("ALL");
      window.setTimeout(() => setCopied(null), 900);
    } catch {
      /* ignore */
    }
  };

  const getExportText = () => list.join(deEscapeDelimiter(delimiter || "\n"));

  /* -------------------------------- validate ------------------------------- */

  const validation = useMemo(() => {
    const raw = validationInput.trim();
    if (!raw) return { type: "empty" as const };
    const stripped = raw.replace(/[{}]/g, "");
    if (uuid.validate(stripped)) {
      const ver = uuid.version(stripped);
      return { type: "uuid" as const, valid: true, version: ver };
    }
    const alpha = nanoAlphabet || DEFAULT_NANO_ALPHABET;
    const rx = new RegExp(`^[${escapeRegExp(alpha)}]+$`);
    return { type: "nanoid" as const, valid: rx.test(raw), length: raw.length, expected: nanoSize };
  }, [validationInput, nanoAlphabet, nanoSize]);

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <MotionGlassCard className="p-4 md:p-6 lg:p-8">
      <ToolPageHeader
        icon={Hash}
        title="UUID & NanoID Generator"
        description="Secure IDs with custom rules, batch generation, formatting, validation & export."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              icon={RefreshCw}
              label="Clear"
              variant="outline"
              onClick={() => setList([])}
            />
            <ActionButton icon={Shuffle} label="Generate" onClick={run} />
            <CopyButton getText={getExportText} disabled={list.length === 0} />
            <ExportTextButton
              filename={filename || "ids.txt"}
              getText={getExportText}
              label="Export .txt"
              icon={Download}
              disabled={list.length === 0}
            />
          </>
        }
      />

      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose generator, size/count, formatting & uniqueness.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {/* Left: mode & common */}
          <div className="rounded-lg border p-3 space-y-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="uuid" className="gap-2">
                  <Key className="h-4 w-4" /> UUID
                </TabsTrigger>
                <TabsTrigger value="nanoid" className="gap-2">
                  <TypeIcon className="h-4 w-4" /> NanoID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="uuid" className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField
                    label="Version"
                    value={uuidVersion}
                    onValueChange={(v) => setUuidVersion(v as UuidVersion)}
                    options={[
                      { value: "v1", label: "v1 — time-based" },
                      { value: "v4", label: "v4 — random" },
                      { value: "v5", label: "v5 — namespace/name" },
                      { value: "v7", label: "v7 — Unix time + rand" },
                    ]}
                  />
                  <InputField
                    label="Count"
                    type="number"
                    min={1}
                    max={1000}
                    value={String(count)}
                    onChange={(e) => setCount(clampInt(e.target.value, 1, 1000))}
                  />

                  {uuidVersion === "v5" && (
                    <>
                      <SelectField
                        label="v5 Namespace"
                        value={v5NamespacePreset}
                        onValueChange={(v) => setV5NamespacePreset(v as "URL" | "DNS" | "Custom")}
                        options={[
                          { value: "URL", label: "URL (6ba7b811-...)" },
                          { value: "DNS", label: "DNS (6ba7b810-...)" },
                          { value: "Custom", label: "Custom (paste UUID)" },
                        ]}
                      />
                      {v5NamespacePreset === "Custom" && (
                        <InputField
                          label="Custom Namespace (UUID)"
                          placeholder="e.g. 6ba7b811-9dad-11d1-80b4-00c04fd430c8"
                          value={v5Namespace}
                          onChange={(e) => setV5Namespace(e.target.value)}
                        />
                      )}
                      <InputField
                        label="Name (string)"
                        placeholder="e.g. https://tariqul.dev"
                        value={v5Name}
                        onChange={(e) => setV5Name(e.target.value)}
                      />
                    </>
                  )}

                  <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <SwitchRow
                      label="Uppercase"
                      checked={uuidUpper}
                      onCheckedChange={(v) => setUuidUpper(Boolean(v))}
                    />
                    <SwitchRow
                      label="Hyphens"
                      checked={uuidHyphens}
                      onCheckedChange={(v) => setUuidHyphens(Boolean(v))}
                    />
                    <SwitchRow
                      label="Braces"
                      checked={uuidBraces}
                      onCheckedChange={(v) => setUuidBraces(Boolean(v))}
                    />
                    <SwitchRow
                      label="Unique only"
                      checked={uniqueOnly}
                      onCheckedChange={(v) => setUniqueOnly(Boolean(v))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nanoid" className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField
                    label="Size"
                    type="number"
                    min={3}
                    max={200}
                    value={String(nanoSize)}
                    onChange={(e) => setNanoSize(clampInt(e.target.value, 3, 200))}
                  />
                  <InputField
                    label="Count"
                    type="number"
                    min={1}
                    max={1000}
                    value={String(count)}
                    onChange={(e) => setCount(clampInt(e.target.value, 1, 1000))}
                  />
                  <SelectField
                    label="Alphabet Preset"
                    value={nanoPreset}
                    onValueChange={(k) => {
                      setNanoPreset(k);
                      setNanoAlphabet(PRESETS[k] ?? DEFAULT_NANO_ALPHABET);
                    }}
                    options={Object.keys(PRESETS).map((k) => ({ value: k, label: k }))}
                  />
                  <InputField
                    label="Custom Alphabet"
                    value={nanoAlphabet}
                    onChange={(e) => {
                      setNanoAlphabet(e.target.value);
                      setNanoPreset("Custom");
                    }}
                    hint={`Alphabet length ${nanoAlphabet.length}`}
                  />
                  <div className="sm:col-span-2">
                    <SwitchRow
                      label="Unique only"
                      checked={uniqueOnly}
                      onCheckedChange={(v) => setUniqueOnly(Boolean(v))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Middle: formatting */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="h-4 w-4" /> Formatting
            </div>
            <InputField
              label="Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. id_"
            />
            <InputField
              label="Suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. _prod"
            />
            <InputField
              label="Join delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              hint="Use \\n or \\t for newline/tab"
            />
            <InputField
              label="Filename (export)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="ids.txt"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Stat
                label="Entropy"
                value={`${entropyBits} bits`}
                hint={
                  mode === "uuid" && uuidVersion !== "v5"
                    ? "per ID (v1/v4/v7)"
                    : uuidVersion === "v5"
                      ? "deterministic"
                      : undefined
                }
              />
              <Stat label="Planned count" value={count} hint="IDs to generate" />
            </div>
          </div>

          {/* Right: quick tools & validate */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wand2 className="h-4 w-4" /> Quick Tools
            </div>
            <div className="grid gap-2">
              <ActionButton
                icon={RefreshCw}
                label="Clear results"
                variant="outline"
                onClick={() => setList([])}
              />
              <ActionButton
                icon={Copy}
                label={copied === "ALL" ? "Copied" : "Copy all"}
                onClick={copyAll}
                disabled={list.length === 0}
              />
              <ExportTextButton
                filename={filename || "ids.txt"}
                getText={getExportText}
                label="Export .txt"
                icon={Download}
                disabled={list.length === 0}
              />
              <ActionButton
                icon={fullscreen ? Minimize2 : Fullscreen}
                label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => setFullscreen((v) => !v)}
              />
            </div>
            <Separator className="my-2" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4" /> Validate
            </div>
            <InputField
              placeholder="Paste an ID to validate (UUID or NanoID)"
              value={validationInput}
              onChange={(e) => setValidationInput(e.target.value)}
            />
            <ValidationResult validation={validation} />
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-6" />

      {/* Results */}
      <div className={clsx(fullscreen ? "fixed inset-2 z-50" : "relative", "rounded-2xl")}>
        <GlassCard className={clsx("shadow-sm h-full", fullscreen && "ring-1 ring-primary/30")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Generated IDs</CardTitle>
                <CardDescription>
                  {list.length === 0
                    ? "Click Generate to create IDs."
                    : `Showing ${list.length} ID${list.length > 1 ? "s" : ""}.`}
                </CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="h-4 w-4" />
                {mode === "uuid" ? `UUID ${uuidVersion.toUpperCase()}` : `NanoID (${nanoSize})`}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {errors && (
              <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                {errors}
              </div>
            )}

            {list.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Tip: use <b>Prefix/Suffix</b> for environment tags (e.g., <code>id_</code>,{" "}
                <code>_prod</code>). Enable <b>Unique only</b> to dedupe.
              </div>
            ) : (
              <>
                {/* Desktop grid */}
                <div className="hidden md:grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((id, i) => (
                    <IdCard
                      key={`${id}-${i}`}
                      idx={i}
                      id={id}
                      onCopy={() => copyOne(id)}
                      copied={copied === id}
                    />
                  ))}
                </div>

                {/* Mobile textarea */}
                <div className="md:hidden">
                  <div className="flex justify-end mb-2">
                    <ActionButton
                      icon={Copy}
                      label={copied === "ALL" ? "Copied" : "Copy all"}
                      variant="outline"
                      onClick={copyAll}
                    />
                  </div>
                  <TextareaField
                    readOnly
                    value={list.join("\n")}
                    onValueChange={() => {}}
                    textareaClassName="min-h-[260px] font-mono text-xs"
                  />
                </div>
              </>
            )}
          </CardContent>
        </GlassCard>
      </div>
    </MotionGlassCard>
  );
}

/* -------------------------------- sub-views -------------------------------- */

function IdCard({
  idx,
  id,
  onCopy,
  copied,
}: {
  idx: number;
  id: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">ID {idx + 1}</span>
        <ActionButton
          icon={copied ? Check : Copy}
          label={copied ? "Copied" : "Copy"}
          variant="outline"
          size="sm"
          onClick={onCopy}
        />
      </div>
      <TextareaField
        readOnly
        value={id}
        onValueChange={() => {}}
        textareaClassName="min-h-[60px] font-mono text-xs"
      />
    </div>
  );
}

function ValidationResult({
  validation,
}: {
  validation:
    | { type: "empty" }
    | { type: "uuid"; valid: boolean; version: number }
    | { type: "nanoid"; valid: boolean; length: number; expected: number };
}) {
  if (validation.type === "empty")
    return <p className="text-xs text-muted-foreground">Paste an ID above.</p>;
  if (validation.type === "uuid") {
    return (
      <p className="text-xs">
        UUID:{" "}
        <b className={validation.valid ? "text-emerald-500" : "text-destructive"}>
          {validation.valid ? "valid" : "invalid"}
        </b>
        {validation.valid && (
          <>
            {" "}
            • version <b>{validation.version}</b>
          </>
        )}
      </p>
    );
  }
  return (
    <p className="text-xs">
      NanoID:{" "}
      <b className={validation.valid ? "text-emerald-500" : "text-destructive"}>
        {validation.valid ? "valid" : "invalid"}
      </b>{" "}
      • length <b>{validation.length}</b> (expected ~{validation.expected})
    </p>
  );
}
