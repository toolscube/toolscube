"use client";

import { Hash, Key, ListChecks, Shuffle, Type as TypeIcon, Upload, Wand2 } from "lucide-react";
import { customAlphabet, nanoid as nanoidFn } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as uuid from "uuid";
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
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STORAGE_KEY = "toolscube:uuid-nanoid-v1";

const DEFAULT_NANO_ALPHABET = "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PRESETS: Record<string, string> = {
  "URL-safe (default)": DEFAULT_NANO_ALPHABET,
  Alphanumeric: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "Hex (lowercase)": "0123456789abcdef",
  "HEX (uppercase)": "0123456789ABCDEF",
  "Numbers only": "0123456789",
};

function deEscapeDelimiter(s: string) {
  return s.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}
function clampInt(v: string, min: number, max: number) {
  const n = parseInt(v.replace(/[^\d-]/g, ""), 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function UuidNanoidClient() {
  const [mode, setMode] = useState<Mode>("uuid");

  const [count, setCount] = useState<number>(12);
  const [uniqueOnly, setUniqueOnly] = useState<boolean>(true);
  const [prefix, setPrefix] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>("\\n");

  const [uuidVersion, setUuidVersion] = useState<UuidVersion>("v4");
  const [uuidUpper, setUuidUpper] = useState<boolean>(false);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidBraces, setUuidBraces] = useState<boolean>(false);
  const [v5NamespacePreset, setV5NamespacePreset] = useState<"URL" | "DNS" | "Custom">("URL");
  const [v5Namespace, setV5Namespace] = useState<string>("");
  const [v5Name, setV5Name] = useState<string>("");

  const [nanoSize, setNanoSize] = useState<number>(21);
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [nanoAlphabet, setNanoAlphabet] = useState<string>(DEFAULT_NANO_ALPHABET);
  const [nanoPreset, setNanoPreset] = useState<string>("URL-safe (default)");

  const [list, setList] = useState<string[]>([]);
  const [validationInput, setValidationInput] = useState<string>("");
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      setMode((s.mode as Mode) ?? "uuid");
      setCount(Number.isFinite(s.count) ? s.count : 12);
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
      setAutoRun(Boolean(s.autoRun ?? true));
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
            autoRun,
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
    autoRun,
  ]);

  const entropyBits = useMemo(() => {
    if (mode === "uuid") {
      if (uuidVersion === "v5") return 0;
      return 122;
    }
    const L = Math.max(1, nanoAlphabet.length);
    const bits = nanoSize * Math.log2(L);
    return Math.round(bits);
  }, [mode, uuidVersion, nanoAlphabet, nanoSize]);

const formatUuid = useCallback(
  (id: string) => {
    let s = id;
    if (!uuidHyphens) s = s.replace(/-/g, "");
    if (uuidUpper) s = s.toUpperCase();
    if (uuidBraces) s = `{${s}}`;
    if (prefix) s = `${prefix}${s}`;
    if (suffix) s = `${s}${suffix}`;
    return s;
  },
  [uuidHyphens, uuidUpper, uuidBraces, prefix, suffix],
);

const genUuidOnce = useCallback((): string => {
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
    default:
      return formatUuid(uuid.v4());
  }
}, [uuidVersion, v5NamespacePreset, v5Namespace, v5Name, formatUuid]);


const genNanoOnce = useCallback((): string => {
  const core =
    nanoAlphabet === DEFAULT_NANO_ALPHABET
      ? nanoidFn(nanoSize)
      : customAlphabet(nanoAlphabet, nanoSize)();
  return `${prefix}${core}${suffix}`;
}, [nanoAlphabet, nanoSize, prefix, suffix]);


const run = useCallback(() => {
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
}, [mode, count, uniqueOnly, genUuidOnce, genNanoOnce]);

  useEffect(() => {
    if (!autoRun) return;
    const t = window.setTimeout(() => {
      run();
    }, 150);
    return () => window.clearTimeout(t);
  }, [autoRun, run]);

  const resetAll = () => {
    setMode("uuid");
    setCount(12);
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
    setList([]);
    setErrors(null);
    setAutoRun(true);
  };

  const getExportText = () => list.join(deEscapeDelimiter(delimiter || "\n"));

  const validation = useMemo(() => {
    const raw = validationInput.trim();
    if (!raw) return { type: "empty" as const };
    const stripped = raw.replace(/[{}]/g, "");
    if (uuid.validate(stripped)) {
      const ver = uuid.version(stripped);
      return { type: "uuid" as const, valid: true, version: ver };
    }
    const alpha = nanoAlphabet || DEFAULT_NANO_ALPHABET;
    const allowed = new Set([...alpha]);
    const valid = [...raw].every((ch) => allowed.has(ch));
    return { type: "nanoid" as const, valid, length: raw.length, expected: nanoSize };
  }, [validationInput, nanoAlphabet, nanoSize]);

  return (
    <>
      <ToolPageHeader
        icon={Hash}
        title="UUID & NanoID Generator"
        description="Secure IDs with custom rules, batch generation, formatting, validation & export."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton label="Copy All" getText={getExportText} disabled={list.length === 0} />
            <ActionButton variant="default" icon={Shuffle} label="Generate" onClick={run} />
          </>
        }
      />

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose generator, size/count, formatting & uniqueness.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {/* Left: mode & common */}
          <div className="rounded-lg border p-3 space-y-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full h-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="uuid" className="gap-2">
                  <Key className="h-4 w-4" /> UUID
                </TabsTrigger>
                <TabsTrigger value="nanoid" className="gap-2">
                  <TypeIcon className="h-4 w-4" /> NanoID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="uuid" className="mt-3 space-y-3">
                <div className="grid gap-3 items-end sm:grid-cols-2">
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

                  <div className="grid grid-cols-1 sm:col-span-2 gap-3">
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
                      setNanoPreset(k as string);
                      setNanoAlphabet(PRESETS[k as string] ?? DEFAULT_NANO_ALPHABET);
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
            <div className="grid grid-cols-2 gap-2">
              <ResetButton label="Clear results" onClick={() => setList([])} />
              <CopyButton label="Copy All" getText={getExportText} disabled={list.length === 0} />

              <ExportTextButton
                filename="ids.txt"
                getText={getExportText}
                disabled={list.length === 0}
              />
            </div>
            <SwitchRow
              label="Auto Run"
              hint="Re-run on every change"
              checked={autoRun}
              onCheckedChange={(v) => setAutoRun(Boolean(v))}
            />
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
      <div className="relative rounded-2xl">
        <GlassCard className="shadow-sm h-full">
          <CardHeader>
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
                    <div
                      key={`id-${i as number}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <span className="font-mono text-sm break-all">{id}</span>
                      <CopyButton size="sm" getText={() => id} />
                    </div>
                  ))}
                </div>

                {/* Mobile textarea */}
                <div className="md:hidden">
                  <CopyButton
                    label="Copy All"
                    getText={getExportText}
                    disabled={list.length === 0}
                  />
                  <TextareaField
                    readOnly
                    value={list.join("\n")}
                    onValueChange={() => {}}
                    textareaClassName="min-h-[260px] text-xs"
                  />
                </div>
              </>
            )}
          </CardContent>
        </GlassCard>
      </div>
    </>
  );
}

/* sub-views */
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
