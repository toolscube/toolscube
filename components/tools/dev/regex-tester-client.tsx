"use client";

import { Copy, Filter, Info, ListChecks, Regex, Save, Scissors, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { escapeHtml, FLAG_META, PRESETS } from "@/lib/utils/dev/regex-tester";

export default function RegexTesterClient() {
  const [pattern, setPattern] = useState<string>(String.raw`\b[A-Za-z]+\b`);
  const [testText, setTestText] = useState<string>(
    "Hello, World!\nবাংলা বাংলা বাংলা\nEmail: foo@example.com",
  );
  const [replaceWith, setReplaceWith] = useState<string>("[$$&]");

  const [flags, setFlags] = useState<Record<Flag, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [highlighted, setHighlighted] = useState<string>("");
  const [replaced, setReplaced] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "match" | "replace" | "ops" | "lines" | "snippet" | "help"
  >("match");

  const [limit, setLimit] = useState<number>(5000);
  const [timeoutMs, setTimeoutMs] = useState<number>(250);
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [perf, setPerf] = useState<{ took: number; limited: boolean } | null>(null);
  const [lineFilterKeep, setLineFilterKeep] = useState<boolean>(true);

  const activeFlags = useMemo(
    () => (Object.keys(FLAG_META) as Flag[]).filter((k) => flags[k]).join(""),
    [flags],
  );

  const buildRegex = useCallback((): RegExp | null => {
    try {
      return new RegExp(pattern, activeFlags);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid pattern");
      return null;
    }
  }, [pattern, activeFlags]);

  const run = useCallback(() => {
    setError(null);
    const rx = buildRegex();
    if (!rx) {
      setMatches([]);
      setHighlighted(escapeHtml(testText));
      setReplaced("");
      setPerf(null);
      return;
    }

    const start = performance.now();

    const reader = new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : `${rx.flags}g`);

    const items: MatchItem[] = [];
    let m: RegExpExecArray | null;
    const deadline = Date.now() + timeoutMs;

    m = reader.exec(testText);
    while (m !== null) {
      if (Date.now() > deadline) {
        setError(`Stopped after ${timeoutMs}ms (possible catastrophic backtracking).`);
        break;
      }

      const groups: Record<string, string | undefined> = {};
      if (m.groups) {
        for (const [k, v] of Object.entries(m.groups)) {
          groups[k] = v;
        }
      }

      items.push({ text: m[0], index: m.index, length: m[0].length, groups });

      if (items.length >= limit) break;

      if (m.index === reader.lastIndex) {
        reader.lastIndex++;
      }

      m = reader.exec(testText);
    }

    const took = performance.now() - start;
    setPerf({ took, limited: items.length >= limit });
    setMatches(items);

    if (items.length === 0) {
      setHighlighted(escapeHtml(testText));
    } else {
      let out = "";
      let last = 0;
      for (const it of items) {
        out += escapeHtml(testText.slice(last, it.index));
        out += `<mark class="rounded px-1">${escapeHtml(testText.substr(it.index, it.length))}</mark>`;
        last = it.index + it.length;
      }
      out += escapeHtml(testText.slice(last));
      setHighlighted(out);
    }
    try {
      setReplaced(testText.replace(rx, replaceWith));
    } catch {
      setReplaced("");
    }
  }, [buildRegex, testText, replaceWith, limit, timeoutMs]);

  useEffect(() => {
    if (autoRun) run();
  }, [autoRun, run]);

  useEffect(() => {
    try {
      const raw = window.location.hash.slice(1);
      if (!raw) return;
      const parsed = JSON.parse(decodeURIComponent(atob(raw)));
      if (parsed?.p) setPattern(parsed.p);
      if (parsed?.t) setTestText(parsed.t);
      if (parsed?.r) setReplaceWith(parsed.r);
      if (parsed?.f) setFlags(parsed.f as Record<Flag, boolean>);
      if (parsed?.tab) setActiveTab(parsed.tab);
      if (parsed?.limit) setLimit(parsed.limit);
      if (parsed?.timeoutMs) setTimeoutMs(parsed.timeoutMs);
      if (parsed?.autoRun !== undefined) setAutoRun(Boolean(parsed.autoRun));
    } catch {
      // ignore
    }
  }, []);

  function toggleFlag(f: Flag) {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  }

  function loadPreset(p: string) {
    setPattern(p);
  }

  function resetAll() {
    setPattern(String.raw`\b[A-Za-z]+\b`);
    setTestText("Hello, World!\nআমার সোনার বাংলা\nEmail: foo@example.com");
    setReplaceWith("[$$&]");
    setFlags({ g: true, i: false, m: false, s: false, u: false, y: false });
    setError(null);
    setPerf(null);
  }

  function savePresetLocal() {
    const name = prompt("Preset name?")?.trim();
    if (!name) return;
    const list = loadLocalPresets();
    list.push({ name, pattern });
    localStorage.setItem("regexLocalPresets", JSON.stringify(list));
    alert("Saved!");
  }

  function loadLocalPresets(): { name: string; pattern: string }[] {
    try {
      const raw = localStorage.getItem("regexLocalPresets");
      return raw ? (JSON.parse(raw) as { name: string; pattern: string }[]) : [];
    } catch {
      return [];
    }
  }

  const jsSnippet = `// JavaScript snippet
const rx = /${pattern.replaceAll("/", "\\/")}/${activeFlags || ""};
const text = /* your input */;
const matches = text.matchAll(rx);
for (const m of matches) {
  console.log(m[0], m.index, m.groups);
}`;

  const localPresets = loadLocalPresets();

  const CSVRows: (string | number)[][] = [
    ["#", "index", "length", "text"],
    ...matches.map((m, i) => [i + 1, m.index, m.length, JSON.stringify(m.text)]),
  ];

  const payload = {
    p: pattern,
    t: testText,
    r: replaceWith,
    f: flags,
    tab: activeTab,
    limit,
    timeoutMs,
    autoRun,
  };
  const hash = btoa(encodeURIComponent(JSON.stringify(payload)));
  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.hash = hash;
    return url.toString();
  }, [hash]);

  return (
    <>
      <ToolPageHeader
        icon={Regex}
        title="Regex Tester"
        description="Test & debug regular expressions online."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton getText={() => shareLink} />
            <ExportTextButton
              label="Export JSON"
              filename="regex-matches.json"
              getText={() => {
                const payload = {
                  pattern,
                  flags: activeFlags,
                  matches,
                  sourceLength: testText.length,
                  generatedAt: new Date().toISOString(),
                };
                return JSON.stringify(payload, null, 2);
              }}
            />
            <ExportCSVButton
              variant="default"
              filename="regex-matches.csv"
              getRows={() => CSVRows}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column */}
        <GlassCard className="shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Pattern & Flags</CardTitle>
            <CardDescription>Write your regex, toggle flags, tweak limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField
              label="Pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={String.raw`e.g. \b[A-Za-z]+\b`}
              className="font-mono"
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">Flags</div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(FLAG_META) as Flag[]).map((k) => (
                  <ActionButton
                    key={k}
                    size="sm"
                    variant={flags[k] ? "default" : "outline"}
                    label={FLAG_META[k].label}
                    onClick={() => toggleFlag(k)}
                    className="h-8 w-8 p-0 font-mono"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                g=global, i=ignore case, m=multiline, s=dotAll, u=unicode, y=sticky
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Presets</div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.concat(localPresets).map((p) => (
                  <ActionButton
                    key={`${p.name}-${p.pattern}`}
                    variant="secondary"
                    size="sm"
                    label={p.name}
                    onClick={() => loadPreset(p.pattern)}
                  />
                ))}
                <ActionButton size="sm" onClick={savePresetLocal} label="Save" icon={Save} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Match limit"
                type="number"
                min={1}
                max={1000000}
                value={String(limit)}
                onChange={(e) => setLimit(Number(e.target.value) || 1)}
              />
              <InputField
                label="Timeout (ms)"
                type="number"
                min={50}
                max={10000}
                value={String(timeoutMs)}
                onChange={(e) => setTimeoutMs(Math.max(50, Number(e.target.value) || 50))}
              />
            </div>

            <SwitchRow
              label="Auto-run"
              hint="Re-run on every change"
              checked={autoRun}
              onCheckedChange={(v) => setAutoRun(Boolean(v))}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
                <Info className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Regex warning</p>
                  <p className="text-xs opacity-90">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge className="font-mono">
              /{pattern}/{activeFlags || "(no flags)"}
            </Badge>
            {perf && (
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> {perf.took.toFixed(2)}ms{" "}
                {perf.limited && "(limited)"}
              </span>
            )}

            <ExportTextButton
              size="sm"
              className="ml-auto"
              filename="regex-state.json"
              label="State"
              getText={() =>
                JSON.stringify(
                  {
                    p: pattern,
                    t: testText,
                    r: replaceWith,
                    f: flags,
                    tab: activeTab,
                    limit,
                    timeoutMs,
                    autoRun,
                  },
                  null,
                  2,
                )
              }
            />

            <InputField
              fileButtonSize="sm"
              type="file"
              accept="application/json"
              onFilesChange={async (files) => {
                const f = files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const parsed = JSON.parse(String(reader.result));
                    if (parsed?.p) setPattern(parsed.p);
                    if (parsed?.t) setTestText(parsed.t);
                    if (parsed?.r) setReplaceWith(parsed.r);
                    if (parsed?.f) setFlags(parsed.f as Record<Flag, boolean>);
                    if (parsed?.tab) setActiveTab(parsed.tab);
                    if (parsed?.limit) setLimit(parsed.limit);
                    if (parsed?.timeoutMs) setTimeoutMs(parsed.timeoutMs);
                    if (parsed?.autoRun !== undefined) setAutoRun(Boolean(parsed.autoRun));
                  } catch {
                    alert("Invalid file");
                  }
                };
                reader.readAsText(f);
              }}
            />
          </CardFooter>
        </GlassCard>

        {/* Right column */}
        <GlassCard className="shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Test Area</CardTitle>
            <CardDescription>Type or paste your text to test the pattern on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <TextareaField
              label="Test Text"
              value={testText}
              onValueChange={setTestText}
              textareaClassName="min-h-[180px] font-mono"
            />

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="replace">Replace</TabsTrigger>
                <TabsTrigger value="ops">Operations</TabsTrigger>
                <TabsTrigger value="lines">Line Tools</TabsTrigger>
                <TabsTrigger value="snippet">JS Snippet</TabsTrigger>
                <TabsTrigger value="help">Cheatsheet</TabsTrigger>
              </TabsList>

              {/* Match */}
              <TabsContent value="match" className="space-y-3">
                <div className="rounded-md border p-3">
                  <div
                    className="prose prose-sm max-w-none whitespace-pre-wrap font-mono leading-relaxed dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Matches ({matches.length})</div>
                  <div className="max-h-56 space-y-2 overflow-auto rounded-md border p-2">
                    {matches.length === 0 && (
                      <p className="text-sm text-muted-foreground">No matches found.</p>
                    )}
                    {matches.map((m, i) => (
                      <div key={`${m.index}-${i}`} className="rounded-md bg-muted/50 p-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            #{i + 1}
                          </Badge>
                          <span className="font-mono">index={m.index}</span>
                          <span className="font-mono">length={m.length}</span>
                          <span className="truncate font-mono">
                            match=<strong>{m.text}</strong>
                          </span>
                        </div>
                        {Object.keys(m.groups || {}).length > 0 && (
                          <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                            {Object.entries(m.groups).map(([k, v]) => (
                              <div
                                key={k}
                                className="rounded border bg-background p-1 font-mono text-[11px]"
                              >
                                <span className="opacity-70">group &lt;{k}&gt;:</span>{" "}
                                {v ?? "undefined"}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Replace */}
              <TabsContent value="replace" className="space-y-3">
                <InputField
                  label="Replace With"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  placeholder="$$&"
                  className="font-mono"
                  hint="Use tokens like $$&, $1, $<name>"
                />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Preview</div>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm">
                      {replaced}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              {/* Operations */}
              <TabsContent value="ops" className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <GlassCard>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ListChecks className="h-4 w-4" />
                        test()
                      </CardTitle>
                      <CardDescription>Whether the pattern matches at least once.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border bg-muted/30 p-3 font-mono text-sm">
                        {String(matches.length > 0)}
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Filter className="h-4 w-4" />
                        split()
                      </CardTitle>
                      <CardDescription>Split text by the regex.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-auto">
                        {JSON.stringify(testText.split(buildRegex() || /$^/), null, 2)}
                      </div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Scissors className="h-4 w-4" />
                        matchAll()
                      </CardTitle>
                      <CardDescription>Export of matches with indices and groups.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border bg-muted/30 p-3 font-mono text-xs max-h-72 overflow-auto">
                        {JSON.stringify(matches, null, 2)}
                      </div>
                    </CardContent>
                  </GlassCard>
                </div>
              </TabsContent>

              {/* Line tools */}
              <TabsContent value="lines" className="space-y-3">
                <SwitchRow
                  label="Keep matching lines"
                  hint="Toggle to switch between keep / remove."
                  checked={lineFilterKeep}
                  onCheckedChange={(v) => setLineFilterKeep(Boolean(v))}
                />
                <div className="rounded-md border bg-muted/30 p-3">
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm">
                    {(() => {
                      const rx = buildRegex();
                      if (!rx) return "";
                      const out: string[] = [];
                      for (const line of testText.split(/\n/)) {
                        const ok = rx.test(line);
                        if ((lineFilterKeep && ok) || (!lineFilterKeep && !ok)) out.push(line);
                      }
                      return out.join("\n");
                    })()}
                  </pre>
                </div>
              </TabsContent>

              {/* Snippet */}
              <TabsContent value="snippet" className="space-y-2">
                <div className="rounded-md border bg-muted/30 p-3">
                  <pre className="font-mono text-xs leading-relaxed">{jsSnippet}</pre>
                </div>
                <CopyButton size="sm" label="Copy snippet" getText={() => jsSnippet} />
              </TabsContent>

              {/* Cheatsheet */}
              <TabsContent value="help" className="space-y-2 text-sm text-muted-foreground">
                <div className="rounded-md border p-3">
                  <p className="mb-2 text-foreground">Cheatsheet</p>
                  <ul className="grid list-disc gap-1 pl-5 md:grid-cols-2">
                    <li>
                      <code>^</code>, <code>$</code> — line anchors (use <code>m</code>)
                    </li>
                    <li>
                      <code>.</code> — any char (include newline with <code>s</code>)
                    </li>
                    <li>
                      <code>\b</code>, <code>\B</code> — word boundaries
                    </li>
                    <li>
                      <code>(?:…)</code> — non-capturing group
                    </li>
                    <li>
                      <code>(?=…)</code>/<code>(?!…)</code> — lookahead
                    </li>
                    <li>
                      <code>(?&lt;=…)</code>/<code>(?&lt;!…)</code> — lookbehind
                    </li>
                    <li>
                      <code>(?&lt;name&gt;…)</code> — named capture; use <code>$&lt;name&gt;</code>{" "}
                      in replace
                    </li>
                    <li>
                      <code>
                        x{"{"}n{","}m{"}"}
                      </code>{" "}
                      — quantifier; beware of catastrophic backtracking
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex items-center gap-2">
            <CopyButton
              label="Copy Current View"
              icon={Copy}
              getText={() => {
                if (activeTab === "replace") return replaced;
                if (activeTab === "snippet") return jsSnippet;
                if (activeTab === "lines") {
                  const rx = buildRegex();
                  if (!rx) return "";
                  const out: string[] = [];
                  for (const line of testText.split(/\n/)) {
                    const ok = rx.test(line);
                    if ((lineFilterKeep && ok) || (!lineFilterKeep && !ok)) out.push(line);
                  }
                  return out.join("\n");
                }
                return testText;
              }}
            />
          </CardFooter>
        </GlassCard>
      </div>
    </>
  );
}
