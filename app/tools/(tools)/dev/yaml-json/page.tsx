// app/tools/(tools)/dev/yaml-json/page.tsx
"use client";

import { Code2, Copy, Download, Info, RefreshCw, Settings2 } from "lucide-react";
import React from "react";
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
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

type Direction = "auto" | "yaml-to-json" | "json-to-yaml";

export default function YamlJsonPage() {
  // libs
  const [yamlLib, setYamlLib] = React.useState<null | { load: any; dump: any }>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("js-yaml");
      if (mounted) setYamlLib({ load: mod.load, dump: mod.dump });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // io
  const [input, setInput] = React.useState<string>("");
  const [output, setOutput] = React.useState<string>("");

  // options
  const [direction, setDirection] = React.useState<Direction>("auto");
  const [autoRun, setAutoRun] = React.useState(true);

  // JSON formatting
  const [jsonSpaces, setJsonSpaces] = React.useState(2);
  const [jsonSortKeys, setJsonSortKeys] = React.useState(false);

  // YAML formatting
  const [yamlFlow, setYamlFlow] = React.useState(false); // flow style
  const [yamlLineWidth, setYamlLineWidth] = React.useState(80);
  const [yamlSortKeys, setYamlSortKeys] = React.useState(false);
  const [yamlMultiDocs, setYamlMultiDocs] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const detectDirection = React.useCallback((s: string): Direction => {
    const t = s.trim();
    if (!t) return "auto";
    // quick heuristic
    if (t.startsWith("{") || t.startsWith("[")) return "json-to-yaml";
    if (/^---\s|:\s|-\s/.test(t)) return "yaml-to-json";
    return "yaml-to-json";
  }, []);

  const normalizeKeys = (val: any) => {
    if (!jsonSortKeys && !yamlSortKeys) return val;
    const sort = (x: any): any => {
      if (Array.isArray(x)) return x.map(sort);
      if (x && typeof x === "object") {
        return Object.fromEntries(
          Object.keys(x)
            .sort((a, b) => a.localeCompare(b))
            .map((k) => [k, sort(x[k])]),
        );
      }
      return x;
    };
    return sort(val);
  };

  const toYaml = (obj: any) => {
    if (!yamlLib) return "";
    return yamlLib.dump(normalizeKeys(obj), {
      noRefs: true,
      lineWidth: yamlLineWidth || 80,
      flowLevel: yamlFlow ? 0 : -1,
      sortKeys: yamlSortKeys,
    });
  };

  const toJson = (obj: any) => {
    return JSON.stringify(normalizeKeys(obj), null, Math.max(0, jsonSpaces));
  };

  const convert = React.useCallback(() => {
    if (!input.trim()) {
      setError(null);
      setOutput("");
      return;
    }
    setError(null);

    try {
      const dir: Direction = direction === "auto" ? detectDirection(input) : direction;

      if (dir === "yaml-to-json") {
        if (!yamlLib) return; // wait for lib
        if (yamlMultiDocs) {
          const docs: any[] = [];
          // loadAll is not typed on mod, but available
          (yamlLib as any).loadAll
            ? (yamlLib as any).loadAll(input, (doc: any) => docs.push(doc))
            : docs.push(yamlLib.load(input));
          setOutput(toJson(docs));
        } else {
          const obj = yamlLib.load(input);
          setOutput(toJson(obj));
        }
      } else {
        // json-to-yaml
        const obj = JSON.parse(input);
        setOutput(toYaml(obj));
      }
    } catch (e: any) {
      setError(String(e?.message || e));
      setOutput("");
    }
  }, [
    input,
    direction,
    detectDirection,
    yamlLib,
    yamlFlow,
    yamlLineWidth,
    yamlSortKeys,
    yamlMultiDocs,
    jsonSpaces,
    jsonSortKeys,
  ]);

  React.useEffect(() => {
    if (autoRun && yamlLib) convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    input,
    direction,
    autoRun,
    jsonSpaces,
    jsonSortKeys,
    yamlFlow,
    yamlLineWidth,
    yamlSortKeys,
    yamlMultiDocs,
    yamlLib,
  ]);

  const copyOut = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setDirection("auto");
    setAutoRun(true);
    setJsonSpaces(2);
    setJsonSortKeys(false);
    setYamlFlow(false);
    setYamlLineWidth(80);
    setYamlSortKeys(false);
    setYamlMultiDocs(false);
    setCopied(false);
    setError(null);
  };

  const sampleYaml = `---
name: ToolsHub
features:
  - YAML
  - JSON
active: true
count: 3
---
name: Another
tags: [a, b, c]`;

  const exportPayload = React.useMemo(
    () => ({
      input,
      direction,
      options: {
        jsonSpaces,
        jsonSortKeys,
        yamlFlow,
        yamlLineWidth,
        yamlSortKeys,
        yamlMultiDocs,
      },
      output,
      generatedAt: new Date().toISOString(),
    }),
    [
      input,
      direction,
      jsonSpaces,
      jsonSortKeys,
      yamlFlow,
      yamlLineWidth,
      yamlSortKeys,
      yamlMultiDocs,
      output,
    ],
  );

  return (
    <MotionGlassCard className="p-4 md:p-6 lg:p-8">
      <ToolPageHeader
        title="YAML ⇄ JSON"
        description="Convert YAML to JSON and back. Supports multi-doc YAML, pretty/minified JSON, sorted keys, and flow style."
        icon={Code2}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={RefreshCw}
              label="Normalize"
              onClick={() => setInput((s) => s.trim())}
            />

            <ActionButton
              onClick={() => {
                setInput(sampleYaml);
                setDirection("yaml-to-json");
              }}
              label="Load Sample"
            />

            <ExportTextButton
              icon={Download}
              label="Export JSON"
              filename="yaml-json-session.json"
              getText={() => JSON.stringify(exportPayload, null, 2)}
            />
            <ResetButton onClick={resetAll} />
          </div>
        }
      />

      <GlassCard className="shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: input */}
          <div className="lg:col-span-2">
            <TextareaField
              id="input"
              label="Input"
              placeholder="Paste YAML or JSON here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoResize
              className="min-h-[180px]"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField
                id="direction"
                label="Direction"
                value={direction}
                onValueChange={(v) => setDirection(v as Direction)}
                options={[
                  { value: "auto", label: "Auto-detect" },
                  { value: "yaml-to-json", label: "YAML → JSON" },
                  { value: "json-to-yaml", label: "JSON → YAML" },
                ]}
              />
              <SwitchRow label="Auto-run" checked={autoRun} onCheckedChange={setAutoRun} />
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive">
                <Info className="mt-0.5 h-4 w-4" />
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>

          {/* Right: options */}
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <div className="text-sm font-medium">Options</div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs font-medium opacity-80">JSON output</div>
              <InputField
                id="jsonSpaces"
                type="number"
                label="Spaces"
                min={0}
                max={8}
                value={String(jsonSpaces)}
                onChange={(e) => setJsonSpaces(Math.max(0, Number(e.target.value) || 0))}
              />
              <SwitchRow
                label="Sort keys (JSON)"
                checked={jsonSortKeys}
                onCheckedChange={setJsonSortKeys}
              />
            </div>

            <Separator className="my-3" />

            <div className="grid gap-2">
              <div className="text-xs font-medium opacity-80">YAML output</div>
              <SwitchRow label="Flow style" checked={yamlFlow} onCheckedChange={setYamlFlow} />
              <InputField
                id="yamlWidth"
                type="number"
                label="Line width"
                min={40}
                max={200}
                value={String(yamlLineWidth)}
                onChange={(e) =>
                  setYamlLineWidth(Math.min(200, Math.max(40, Number(e.target.value) || 80)))
                }
              />
              <SwitchRow
                label="Sort keys (YAML)"
                checked={yamlSortKeys}
                onCheckedChange={setYamlSortKeys}
              />
              <SwitchRow
                label="Allow multi-doc YAML (---)"
                checked={yamlMultiDocs}
                onCheckedChange={setYamlMultiDocs}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <Separator className="my-6" />

      {/* Output */}
      <GlassCard className="shadow-sm">
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="text-sm font-medium">Output</div>
          <div className="flex gap-2">
            <CopyButton icon={Copy} active={copied} onClick={copyOut}>
              Copy
            </CopyButton>
            <ExportTextButton
              icon={Download}
              label="Download .txt"
              filename="converted.txt"
              getText={() => output}
              disabled={!output}
            />
          </div>
        </div>
        <div className="p-3">
          <TextareaField id="output" value={output} readOnly autoResize className="min-h-[220px]" />
        </div>
      </GlassCard>
    </MotionGlassCard>
  );
}
