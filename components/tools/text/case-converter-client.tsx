"use client";

import { ArrowLeftRight, Eraser, Info, Replace, Type as TypeIcon, Wand2 } from "lucide-react";
import * as React from "react";
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
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { applyCase, runPipeline } from "@/lib/utils/text/case-converter";

export default function CaseConverterClient() {
  const [source, setSource] = React.useState<string>("");
  const [mode, setMode] = React.useState<CaseMode>("title");
  const [live, setLive] = React.useState<boolean>(true);

  const [toggles, setToggles] = React.useState<Record<PipelineToggle, boolean>>({
    trim: true,
    collapseSpaces: true,
    removePunctuation: false,
    normalizeQuotes: false,
    removeDiacritics: false,
  });

  const [customSep, setCustomSep] = React.useState<string>("");

  const processed = React.useMemo(() => runPipeline(source, toggles), [source, toggles]);
  const transformed = React.useMemo(() => {
    const base = applyCase(mode, processed);
    if (!customSep) return base;
    return base.replace(/\s+/g, customSep);
  }, [processed, mode, customSep]);

  const resetAll = () => {
    setSource("");
    setMode("title");
    setLive(true);
    setToggles({
      trim: true,
      collapseSpaces: true,
      removePunctuation: false,
      normalizeQuotes: false,
      removeDiacritics: false,
    });
    setCustomSep("");
  };

  const presetSlug = () => {
    setMode("kebab");
    setToggles({
      trim: true,
      collapseSpaces: true,
      removePunctuation: true,
      normalizeQuotes: true,
      removeDiacritics: true,
    });
    setCustomSep("");
  };
  const presetCode = () => {
    setMode("snake");
    setToggles({
      trim: true,
      collapseSpaces: true,
      removePunctuation: true,
      normalizeQuotes: true,
      removeDiacritics: true,
    });
    setCustomSep("");
  };
  const presetSocial = () => {
    setMode("title");
    setToggles({
      trim: true,
      collapseSpaces: true,
      removePunctuation: false,
      normalizeQuotes: true,
      removeDiacritics: false,
    });
    setCustomSep("");
  };

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={TypeIcon}
        title="Case Converter"
        description="Upper, lower, title, camel/snake/kebab"
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton
              variant="default"
              label="Copy converted"
              getText={() => transformed || ""}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose a case style and optional clean-up pipeline.</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Case mode */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <SelectField
                label="Case Style"
                placeholder="Choose case style"
                value={mode}
                onValueChange={(v) => setMode((v as CaseMode) ?? "title")}
                allowClear={false}
                options={[
                  { value: "upper", label: "UPPER" },
                  { value: "lower", label: "lower" },
                  { value: "title", label: "Title Case" },
                  { value: "sentence", label: "Sentence case" },
                  { value: "camel", label: "camelCase" },
                  { value: "pascal", label: "PascalCase" },
                  { value: "snake", label: "snake_case" },
                  { value: "kebab", label: "kebab-case" },
                  { value: "constant", label: "CONSTANT_CASE" },
                  { value: "capitalized", label: "Capitalized" },
                  { value: "alternating", label: "aLtErNaTiNg" },
                  { value: "invert", label: "iNVERT cASE" },
                ]}
                description="How your text should be transformed."
                triggerClassName="w-full"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "Preset: Slug", onClick: presetSlug },
                  { label: "Preset: Code", onClick: presetCode },
                  { label: "Preset: Social", onClick: presetSocial },
                ].map((preset) => (
                  <ActionButton
                    key={preset.label}
                    size="sm"
                    icon={Wand2}
                    label={preset.label}
                    onClick={preset.onClick}
                  />
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="space-y-3">
              <SwitchRow
                label="Live mode"
                hint="Apply changes as you type."
                checked={live}
                onCheckedChange={setLive}
              />

              <InputField
                label="Replace whitespace with"
                id="customSep"
                placeholder="(Optional) e.g. _ or -"
                value={customSep}
                onChange={(e) => setCustomSep(e.target.value)}
                hint="Useful for custom slugs or tokens after conversion."
              />
            </div>
          </div>

          {/* Pipeline toggles */}
          <div className="space-y-2">
            <Label className="text-sm">Clean-up Pipeline</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <SwitchRow
                label="Trim ends"
                checked={toggles.trim}
                onCheckedChange={(v) => setToggles((t) => ({ ...t, trim: v }))}
              />
              <SwitchRow
                label="Collapse spaces/lines"
                checked={toggles.collapseSpaces}
                onCheckedChange={(v) => setToggles((t) => ({ ...t, collapseSpaces: v }))}
              />
              <SwitchRow
                label="Remove punctuation"
                checked={toggles.removePunctuation}
                onCheckedChange={(v) => setToggles((t) => ({ ...t, removePunctuation: v }))}
              />
              <SwitchRow
                label="Normalize quotes/dashes"
                checked={toggles.normalizeQuotes}
                onCheckedChange={(v) => setToggles((t) => ({ ...t, normalizeQuotes: v }))}
              />
              <SwitchRow
                label="Remove diacritics"
                checked={toggles.removeDiacritics}
                onCheckedChange={(v) => setToggles((t) => ({ ...t, removeDiacritics: v }))}
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Editor & Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Source */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label className="text-sm font-medium">Original Text</Label>
            <div className="flex flex-wrap gap-2">
              <PasteButton
                variant="outline"
                size="sm"
                className="gap-2"
                label="Paste"
                pastedLabel="Pasted"
                smartNewline
                getExisting={() => source}
                setValue={setSource}
              />

              <InputField
                accept=".txt,text/plain"
                type="file"
                onFilesChange={async (files) => {
                  const f = files?.[0];
                  if (!f) return;
                  const text = await f.text();
                  setSource(text);
                }}
              />

              <ExportTextButton
                filename="original.txt"
                getText={() => source}
                label="Export"
                size="sm"
                disabled={!source}
              />
            </div>
          </div>

          <TextareaField
            className="mt-2"
            textareaClassName="min-h-[260px]"
            value={source}
            onValueChange={setSource}
            placeholder="Type or paste text here…"
            autoResize
            showCount
          />

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <ResetButton icon={Eraser} label="Clear" onClick={() => setSource("")} />

            <CopyButton getText={() => source || ""} />

            {!live && (
              <ActionButton
                variant="default"
                icon={Replace}
                label="Convert Text"
                onClick={() => setSource(transformed)}
              />
            )}
          </div>
        </GlassCard>

        {/* Right: Converted */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label className="text-sm font-medium">Converted Preview</Label>
            <Badge variant="secondary" className="gap-1">
              <Info className="h-3.5 w-3.5" />
              {live ? "Live" : "Manual"}
            </Badge>
          </div>

          <TextareaField
            className="mt-2"
            textareaClassName="min-h-[270px]"
            value={
              live
                ? transformed
                : applyCase(mode, runPipeline(source, toggles)).replace(/\s+/g, customSep || "$&")
            }
            readOnly
            placeholder="Converted text will appear here…"
            autoResize
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton label="Copy converted" getText={() => transformed || ""} />
            <ExportTextButton
              filename="transformed.txt"
              getText={() => transformed}
              label="Export"
              size="sm"
              disabled={!transformed}
            />

            {!live && (
              <ActionButton
                variant="default"
                icon={ArrowLeftRight}
                label="Apply to source"
                onClick={() => setSource(transformed)}
              />
            )}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
