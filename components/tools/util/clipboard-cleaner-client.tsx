"use client";

import {
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
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toSentenceCase, toTitleCase } from "@/lib/utils";
import { ClipboardType, Eraser, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Types
type HistoryItem = { id: string; ts: number; src: string; out: string };

// Helpers
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function stripUrls(s: string) {
  const urlRe = /(https?:\/\/|www\.)[^\s]+/gi;
  return s.replace(urlRe, "");
}

function stripEmojis(s: string) {
  try {
    return s.replace(/\p{Extended_Pictographic}/gu, "");
  } catch {
    return s.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
  }
}

function normalizeSmartChars(
  s: string,
  opts: Pick<CleanOptions, "normalizeQuotes" | "normalizeDashes" | "replaceEllipsis">,
) {
  let r = s;
  if (opts.normalizeQuotes) {
    r = r
      .replace(/[\u2018\u2019\u2032]/g, "'")
      .replace(/[\u201C\u201D\u2033]/g, '"')
      .replace(/\u00AB|\u00BB/g, '"');
  }
  if (opts.normalizeDashes) {
    r = r.replace(/[\u2013\u2014]/g, "-");
  }
  if (opts.replaceEllipsis) {
    r = r.replace(/\u2026/g, "...");
  }
  return r;
}

function cleanText(input: string, opts: CleanOptions) {
  let s = input;

  // normalize NBSP & tabs
  s = s.replace(/\u00A0/g, " ");
  if (opts.tabsToSpaces) s = s.replace(/\t/g, " ");

  // normalize smart punctuation
  s = normalizeSmartChars(s, opts);

  // remove zero-width
  if (opts.removeZeroWidth) s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // remove URLs
  if (opts.removeUrls) s = stripUrls(s);

  // remove emojis
  if (opts.removeEmojis) s = stripEmojis(s);

  // line-handling
  if (opts.stripLineBreaks) {
    s = s.replace(/[\r\n]+/g, " ");
  } else if (opts.stripExtraBlankLines) {
    s = s.replace(/\n{3,}/g, "\n\n");
  }

  // spaces
  if (opts.collapseSpaces) s = s.replace(/[ \t]{2,}/g, " ");
  if (opts.trim) s = s.trim();

  // case
  switch (opts.caseMode) {
    case "lower":
      s = s.toLowerCase();
      break;
    case "upper":
      s = s.toUpperCase();
      break;
    case "title":
      s = toTitleCase(s);
      break;
    case "sentence":
      s = toSentenceCase(s);
      break;
  }

  return s;
}

const DEFAULT_OPTS: CleanOptions = {
  trim: true,
  collapseSpaces: true,
  stripLineBreaks: false,
  stripExtraBlankLines: true,
  normalizeQuotes: true,
  normalizeDashes: true,
  replaceEllipsis: true,
  tabsToSpaces: true,
  removeZeroWidth: true,
  removeUrls: false,
  removeEmojis: false,
  caseMode: "none",
  autoCleanOnPaste: true,
};

export default function ClipboardCleanerClient() {
  const [raw, setRaw] = useState("");
  const [opts, setOpts] = useState<CleanOptions>(DEFAULT_OPTS);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("tools:clipclean:opts");
      if (s) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpts({ ...DEFAULT_OPTS, ...(JSON.parse(s) as CleanOptions) });
      }
      const h = localStorage.getItem("tools:clipclean:history");
      if (h) setHistory(JSON.parse(h));
      const r = localStorage.getItem("tools:clipclean:raw");
      if (r) setRaw(r);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tools:clipclean:opts", JSON.stringify(opts));
    } catch {}
  }, [opts]);
  useEffect(() => {
    try {
      localStorage.setItem("tools:clipclean:history", JSON.stringify(history.slice(0, 20)));
    } catch {}
  }, [history]);
  useEffect(() => {
    try {
      localStorage.setItem("tools:clipclean:raw", raw);
    } catch {}
  }, [raw]);

  const cleaned = useMemo(() => cleanText(raw, opts), [raw, opts]);

  const pushHistory = (src: string, out: string) => {
    if (!out.trim()) return;
    setHistory((h) => [{ id: uid("h"), ts: Date.now(), src, out }, ...h].slice(0, 20));
  };

  const onCleanClick = () => {
    pushHistory(raw, cleaned);
  };

  const resetAll = () => {
    setRaw("");
    setOpts(DEFAULT_OPTS);
  };

  // stats
  const stats = useMemo(() => {
    const chars = cleaned.length;
    const words = cleaned.trim() ? cleaned.trim().split(/\s+/).length : 0;
    const lines = cleaned ? cleaned.split(/\r?\n/).length : 0;
    return { chars, words, lines };
  }, [cleaned]);

  return (
    <>
      <ToolPageHeader
        icon={ClipboardType}
        title="Clipboard Cleaner"
        description="Strip formatting and paste as plain text. Clean punctuation, spaces, emojis & more."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <PasteButton />
            <ResetButton icon={Wand2} onClick={onCleanClick} label="Clean" />
            <CopyButton
              variant="default"
              getText={() => cleaned || ""}
              disabled={!cleaned}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose how text should be cleaned.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Case"
            value={opts.caseMode}
            onValueChange={(v) =>
              setOpts({
                ...opts,
                caseMode: (v as CleanOptions["caseMode"]) ?? "none",
              })
            }
            options={[
              { label: "No change", value: "none" },
              { label: "lowercase", value: "lower" },
              { label: "UPPERCASE", value: "upper" },
              { label: "Title Case", value: "title" },
              { label: "Sentence case", value: "sentence" },
            ]}
          />

          <div className="space-y-2">
            <Label>Whitespace & Behavior</Label>
            <div className="flex flex-col gap-2 text-sm">
              <SwitchRow
                checked={opts.trim}
                onCheckedChange={(v) => setOpts({ ...opts, trim: v })}
                label="Trim ends"
              />
              <SwitchRow
                checked={opts.collapseSpaces}
                onCheckedChange={(v) => setOpts({ ...opts, collapseSpaces: v })}
                label="Collapse multiple spaces"
              />
              <SwitchRow
                checked={opts.tabsToSpaces}
                onCheckedChange={(v) => setOpts({ ...opts, tabsToSpaces: v })}
                label="Tabs → spaces"
              />
              <SwitchRow
                checked={opts.stripLineBreaks}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, stripLineBreaks: v })
                }
                label="Flatten line breaks"
              />
              <SwitchRow
                checked={opts.stripExtraBlankLines}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, stripExtraBlankLines: v })
                }
                label="Keep max 1 blank line"
              />
              <SwitchRow
                checked={opts.autoCleanOnPaste}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, autoCleanOnPaste: v })
                }
                label="Auto‑clean on paste"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Characters</Label>
            <div className="flex flex-col gap-2 text-sm">
              <SwitchRow
                checked={opts.normalizeQuotes}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, normalizeQuotes: v })
                }
                label="Smart quotes → ' "
              />
              <SwitchRow
                checked={opts.normalizeDashes}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, normalizeDashes: v })
                }
                label="En/Em dashes → -"
              />
              <SwitchRow
                checked={opts.replaceEllipsis}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, replaceEllipsis: v })
                }
                label="Ellipsis … → ..."
              />
              <SwitchRow
                checked={opts.removeZeroWidth}
                onCheckedChange={(v) =>
                  setOpts({ ...opts, removeZeroWidth: v })
                }
                label="Remove zero‑width chars"
              />
              <SwitchRow
                checked={opts.removeEmojis}
                onCheckedChange={(v) => setOpts({ ...opts, removeEmojis: v })}
                label="Remove emojis"
              />
              <SwitchRow
                checked={opts.removeUrls}
                onCheckedChange={(v) => setOpts({ ...opts, removeUrls: v })}
                label="Remove URLs"
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Editors */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Editor</CardTitle>
          <CardDescription>
            Paste on the left, get clean text on the right.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Original</Label>
              <div className="flex gap-2">
                <InputField
                  type="file"
                  accept=".txt,text/plain"
                  onFilesChange={async (files) => {
                    const f = files?.[0];
                    if (!f) return;
                    const txt = await f.text();
                    setRaw(txt);
                  }}
                />
                <ResetButton
                  icon={Eraser}
                  label="Clear"
                  onClick={() => setRaw("")}
                />
              </div>
            </div>

            <TextareaField
              value={raw}
              onValueChange={setRaw}
              onPaste={(e) => {
                if (!opts.autoCleanOnPaste) return;
                const pasted = e.clipboardData.getData("text");
                if (pasted) {
                  e.preventDefault();
                  const out = cleanText(pasted, opts);
                  const ta = e.target as HTMLTextAreaElement;
                  const selStart = ta.selectionStart || 0;
                  const selEnd = ta.selectionEnd || 0;
                  setRaw(
                    (prev) => prev.slice(0, selStart) + out + prev.slice(selEnd)
                  );
                }
              }}
              placeholder="Paste here (Ctrl/Cmd + V)…"
              textareaClassName="min-h-[220px] font-mono"
            />
            <div className="text-xs text-muted-foreground">
              Tip: Use the Paste button for one‑click clipboard import.
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cleaned</Label>
              <div className="flex gap-2">
                <ExportTextButton
                  variant="outline"
                  filename="cleaned.txt"
                  getText={() => cleaned}
                  label="Export"
                  disabled={!cleaned}
                />
                <CopyButton variant="default" getText={cleaned || ""} />
              </div>
            </div>
            <Textarea readOnly value={cleaned} className="min-h-55" />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{stats.words} words</Badge>
              <Badge variant="secondary">{stats.chars} chars</Badge>
              <Badge variant="secondary">{stats.lines} lines</Badge>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* History */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Last 20 results (local only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No history yet. Clean something to see it here.
            </p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {history.map((h) => (
              <div key={h.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(h.ts).toLocaleString()}</span>
                  <CopyButton
                    variant="outline"
                    size="sm"
                    getText={() => h.out || ""}
                  />
                </div>
                <div className="text-xs text-muted-foreground">Source</div>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word bg-muted/30 rounded p-2 max-h-32">
                  {h.src}
                </pre>
                <div className="text-xs text-muted-foreground">Cleaned</div>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word bg-muted/30 rounded p-2 max-h-32">
                  {h.out}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
