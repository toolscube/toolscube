'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Check, Code, Copy, Download, Filter, Info, ListChecks, Regex, RotateCcw, Save, Scissors, Share2, Timer, Upload } from 'lucide-react';
import React from 'react';

// ---- Types ----
type Flag = 'g' | 'i' | 'm' | 's' | 'u' | 'y';

type MatchItem = {
  text: string;
  index: number;
  length: number;
  groups: Record<string, string | undefined>;
};

const FLAG_META: Record<Flag, { label: string; title: string }> = {
  g: { label: 'g', title: 'global' },
  i: { label: 'i', title: 'ignore case' },
  m: { label: 'm', title: 'multiline (^, $ across lines)' },
  s: { label: 's', title: 'dotAll (dot matches newline)' },
  u: { label: 'u', title: 'unicode' },
  y: { label: 'y', title: 'sticky' },
};

const PRESETS: { name: string; pattern: string }[] = [
  { name: 'Email', pattern: String.raw`(?<!\S)[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?!\S)` },
  { name: 'Bangladeshi Phone', pattern: String.raw`\b(?:\+?88)?01[3-9]\d{8}\b` },
  { name: 'URL', pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*` },
  { name: 'Number', pattern: String.raw`-?\b\d+(?:\.\d+)?\b` },
  { name: 'Word (Bengali)', pattern: String.raw`[\u0980-\u09FF]+` },
];

// Small utils
function escapeHtml(str: string) {
  return str.replaceAll(/&/g, '&amp;').replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;');
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

function downloadFile(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- FlagToggle ----
function FlagToggle({ flag, active, onClick }: { flag: Flag; active: boolean; onClick: () => void }) {
  return (
    <Button type="button" variant={active ? 'default' : 'outline'} size="sm" className={classNames('h-8 w-8 p-0 font-mono', active && 'shadow')} title={FLAG_META[flag].title} onClick={onClick}>
      {FLAG_META[flag].label}
    </Button>
  );
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = React.useState<string>('\\b[A-Za-z]+\\b');
  const [testText, setTestText] = React.useState<string>('Hello, World!\nবাংলা বাংলা বাংলা\nEmail: foo@example.com' as string);
  const [replaceWith, setReplaceWith] = React.useState<string>('[$$&]');
  const [flags, setFlags] = React.useState<Record<Flag, boolean>>({ g: true, i: false, m: false, s: false, u: false, y: false });
  const [error, setError] = React.useState<string | null>(null);
  const [matches, setMatches] = React.useState<MatchItem[]>([]);
  const [highlighted, setHighlighted] = React.useState<string>('');
  const [replaced, setReplaced] = React.useState<string>('');
  const [copied, setCopied] = React.useState<'share' | 'result' | null>(null);
  const [activeTab, setActiveTab] = React.useState<'match' | 'replace' | 'ops' | 'lines'>('match');

  // New features state
  const [limit, setLimit] = React.useState<number>(5000); // max matches displayed
  const [timeoutMs, setTimeoutMs] = React.useState<number>(250); // guard against backtracking
  const [autoRun, setAutoRun] = React.useState<boolean>(true);
  const [perf, setPerf] = React.useState<{ took: number; limited: boolean } | null>(null);
  const [opResult, setOpResult] = React.useState<string>('');
  const [lineFilterKeep, setLineFilterKeep] = React.useState<boolean>(true);

  const activeFlags = React.useMemo(
    () =>
      Object.entries(flags)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(''),
    [flags],
  );

  React.useEffect(() => {
    if (autoRun) run();
  }, [pattern, testText, replaceWith, activeFlags, activeTab, limit, timeoutMs, autoRun]);

  function toggleFlag(f: Flag) {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  }

  function loadPreset(p: string) {
    setPattern(p);
  }

  function resetAll() {
    setPattern('[A-Za-z]+');
    setTestText('Hello, World!\nআমার সোনার বাংলা\nEmail: foo@example.com');
    setReplaceWith('[$$&]');
    setFlags({ g: true, i: false, m: false, s: false, u: false, y: false });
    setError(null);
    setPerf(null);
  }

  function buildRegex(): RegExp | null {
    try {
      return new RegExp(pattern, activeFlags);
    } catch (e: any) {
      setError(e.message || 'Invalid pattern');
      return null;
    }
  }

  function run() {
    setError(null);
    const rx = buildRegex();
    if (!rx) {
      setMatches([]);
      setHighlighted(escapeHtml(testText));
      setReplaced('');
      return;
    }

    const start = performance.now();

    // Guarded global reader
    const globalReader = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');

    const items: MatchItem[] = [];
    let m: RegExpExecArray | null;
    const endTime = Date.now() + timeoutMs;

    while ((m = globalReader.exec(testText))) {
      if (Date.now() > endTime) {
        setError(`Stopped after ${timeoutMs}ms (possible catastrophic backtracking).`);
        break;
      }
      const groups: Record<string, string | undefined> = {};
      if (m.groups) {
        for (const [k, v] of Object.entries(m.groups)) groups[k] = v;
      }
      items.push({ text: m[0], index: m.index, length: m[0].length, groups });
      if (items.length >= limit) break;
      if (m.index === globalReader.lastIndex) globalReader.lastIndex++;
    }
    const took = performance.now() - start;
    setPerf({ took, limited: items.length >= limit });
    setMatches(items);

    // Highlight
    if (items.length === 0) {
      setHighlighted(escapeHtml(testText));
    } else {
      let out = '';
      let last = 0;
      for (const it of items) {
        out += escapeHtml(testText.slice(last, it.index));
        out += `<mark class="rounded px-1">${escapeHtml(testText.substr(it.index, it.length))}</mark>`;
        last = it.index + it.length;
      }
      out += escapeHtml(testText.slice(last));
      setHighlighted(out);
    }

    // Replace preview
    try {
      const replacedText = testText.replace(rx, replaceWith);
      setReplaced(replacedText);
    } catch {
      setReplaced('');
    }

    try {
      setOpResult(String(testText.match(rx) !== null));
    } catch {
      setOpResult('false');
    }
  }

  async function copyShare() {
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
    const url = `${window.location.origin}/tools/dev/regex-tester#${hash}`;
    await navigator.clipboard.writeText(url);
    setCopied('share');
    setTimeout(() => setCopied(null), 1200);
  }

  async function copyResult() {
    let data = testText;
    if (activeTab === 'replace') data = replaced;
    else if (activeTab === 'lines') {
      const rx = buildRegex();
      if (rx) {
        const out: string[] = [];
        for (const line of testText.split(/\n/)) {
          const ok = rx.test(line);
          if ((lineFilterKeep && ok) || (!lineFilterKeep && !ok)) out.push(line);
        }
        data = out.join('\n');
      } else {
        data = '';
      }
    }

    await navigator.clipboard.writeText(data);
    setCopied('result');
    setTimeout(() => setCopied(null), 1200);
  }

  function exportMatchesJSON() {
    const payload = { pattern, flags: activeFlags, matches, sourceLength: testText.length, generatedAt: new Date().toISOString() };
    downloadFile('regex-matches.json', JSON.stringify(payload, null, 2));
  }

  function exportMatchesCSV() {
    const rows = [['#', 'index', 'length', 'text']];
    matches.forEach((m, i) => rows.push([String(i + 1), String(m.index), String(m.length), JSON.stringify(m.text)]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadFile('regex-matches.csv', csv);
  }

  function savePresetLocal() {
    const name = prompt('Preset name?')?.trim();
    if (!name) return;
    const list = JSON.parse(localStorage.getItem('regexLocalPresets') || '[]') as any[];
    list.push({ name, pattern });
    localStorage.setItem('regexLocalPresets', JSON.stringify(list));
    alert('Saved!');
  }

  function loadLocalPresets(): { name: string; pattern: string }[] {
    try {
      return JSON.parse(localStorage.getItem('regexLocalPresets') || '[]');
    } catch {
      return [];
    }
  }

  function importStateFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.p) setPattern(parsed.p);
        if (parsed?.t) setTestText(parsed.t);
        if (parsed?.r) setReplaceWith(parsed.r);
        if (parsed?.f) setFlags(parsed.f);
        if (parsed?.tab) setActiveTab(parsed.tab);
        if (parsed?.limit) setLimit(parsed.limit);
        if (parsed?.timeoutMs) setTimeoutMs(parsed.timeoutMs);
        if (parsed?.autoRun !== undefined) setAutoRun(parsed.autoRun);
      } catch (err) {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  }

  React.useEffect(() => {
    try {
      const raw = window.location.hash.slice(1);
      if (!raw) return;
      const parsed = JSON.parse(decodeURIComponent(atob(raw)));
      if (parsed?.p) setPattern(parsed.p);
      if (parsed?.t) setTestText(parsed.t);
      if (parsed?.r) setReplaceWith(parsed.r);
      if (parsed?.f) setFlags(parsed.f);
      if (parsed?.tab) setActiveTab(parsed.tab);
      if (parsed?.limit) setLimit(parsed.limit);
      if (parsed?.timeoutMs) setTimeoutMs(parsed.timeoutMs);
      if (parsed?.autoRun !== undefined) setAutoRun(parsed.autoRun);
    } catch {}
  }, []);

  const jsSnippet = `// JavaScript snippet
const rx = /${pattern.replaceAll('/', '\\/')}/${activeFlags || ''};
const text = /* your input */;
const matches = text.matchAll(rx);
for (const m of matches) {
  console.log(m[0], m.index, m.groups);
}`;

  const localPresets = loadLocalPresets();

  return (
    <MotionGlassCard className="p-4 md:p-6 lg:p-8">
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div className="w-1/2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Regex className="h-6 w-6" /> Regex Tester
          </h1>
          <p className="text-sm text-muted-foreground">Interactive tester with flags, highlights, replace, performance guard, line tools, and exports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={copyShare} className="gap-2" title="Copy shareable link with current state">
            {copied === 'share' ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} Share
          </Button>
          <Button variant="outline" onClick={exportMatchesJSON} className="gap-2">
            <Download className="h-4 w-4" /> JSON
          </Button>
          <Button variant="outline" onClick={exportMatchesCSV} className="gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard className="shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Pattern & Flags</CardTitle>
            <CardDescription>Write your regex, toggle flags, tweak limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <Input id="pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder={String.raw`e.g. \b[A-Za-z]+\b`} className="font-mono" />
            </div>

            <div className="space-y-2">
              <Label>Flags</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(FLAG_META) as Flag[]).map((k) => (
                  <FlagToggle key={k} flag={k} active={flags[k]} onClick={() => toggleFlag(k)} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">g=global, i=ignore case, m=multiline, s=dotAll, u=unicode, y=sticky</p>
            </div>

            <div className="space-y-2">
              <Label>Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.concat(localPresets).map((p) => (
                  <Button key={p.name} variant="secondary" size="sm" onClick={() => loadPreset(p.pattern)}>
                    {p.name}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={savePresetLocal} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="limit">Match limit</Label>
                <Input id="limit" type="number" min={1} max={1000000} value={limit} onChange={(e) => setLimit(Number(e.target.value) || 1)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input id="timeout" type="number" min={50} max={10000} value={timeoutMs} onChange={(e) => setTimeoutMs(Math.max(50, Number(e.target.value) || 50))} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Auto-run</Label>
                <p className="text-xs text-muted-foreground">Re-run on every change</p>
              </div>
              <Switch checked={autoRun} onCheckedChange={setAutoRun} />
            </div>

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
            <Badge variant="outline" className="font-mono">
              /{pattern}/{activeFlags || '(no flags)'}
            </Badge>
            {perf && (
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> {perf.took.toFixed(2)}ms {perf.limited && '(limited)'}{' '}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-2"
              onClick={() => downloadFile('regex-state.json', JSON.stringify({ p: pattern, t: testText, r: replaceWith, f: flags, tab: activeTab, limit, timeoutMs, autoRun }, null, 2))}>
              <Download className="h-4 w-4" /> State
            </Button>
            <div className="relative inline-flex items-center">
              <input title="Import state JSON" type="file" accept="application/json" className="absolute inset-0 z-10 cursor-pointer opacity-0" onChange={importStateFromFile} />
              <Button variant="outline" size="sm" className="pointer-events-none gap-2">
                <Upload className="h-4 w-4" /> Import
              </Button>
            </div>
          </CardFooter>
        </GlassCard>

        <GlassCard className="shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Test Area</CardTitle>
            <CardDescription>Type or paste your text to test the pattern on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="test-text">Test Text</Label>
              <Textarea id="test-text" value={testText} onChange={(e) => setTestText(e.target.value)} className="min-h-[180px] font-mono" />
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="replace">Replace</TabsTrigger>
                <TabsTrigger value="ops">Operations</TabsTrigger>
                <TabsTrigger value="lines">Line Tools</TabsTrigger>
                <TabsTrigger value="snippet">JS Snippet</TabsTrigger>
                <TabsTrigger value="help">Cheatsheet</TabsTrigger>
              </TabsList>

              <TabsContent value="match" className="space-y-3">
                <div className="rounded-md border p-3">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono leading-relaxed dark:prose-invert" dangerouslySetInnerHTML={{ __html: highlighted }} />
                </div>

                <div className="space-y-2">
                  <Label>Matches ({matches.length})</Label>
                  <div className="max-h-56 space-y-2 overflow-auto rounded-md border p-2">
                    {matches.length === 0 && <p className="text-sm text-muted-foreground">No matches found.</p>}
                    {matches.map((m, i) => (
                      <div key={i} className="rounded-md bg-muted/50 p-2 text-xs">
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
                              <div key={k} className="rounded border bg-background p-1 font-mono text-[11px]">
                                <span className="opacity-70">group &lt;{k}&gt;:</span> {v ?? 'undefined'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="replace" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="replace">Replace With</Label>
                  <Input id="replace" value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)} placeholder="$$&" className="font-mono" />
                  <p className="text-xs text-muted-foreground">
                    Use tokens like <code>$$&</code>, <code>$$1</code>, <code>$$&lt;name&gt;</code>.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-sm">{replaced}</pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ops" className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <GlassCard>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ListChecks className="h-4 w-4" />
                        Test()
                      </CardTitle>
                      <CardDescription>Return whether the pattern matches at least once.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border bg-muted/30 p-3 font-mono text-sm">{String(matches.length > 0)}</div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Filter className="h-4 w-4" />
                        Split()
                      </CardTitle>
                      <CardDescription>Split text by the regex.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border bg-muted/30 p-3 font-mono text-xs max-h-48 overflow-auto">{JSON.stringify(testText.split(buildRegex() || /$^/), null, 2)}</div>
                    </CardContent>
                  </GlassCard>

                  <GlassCard className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Scissors className="h-4 w-4" />
                        MatchAll()
                      </CardTitle>
                      <CardDescription>JSON export of matches with indices and groups.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border bg-muted/30 p-3 font-mono text-xs max-h-72 overflow-auto">{JSON.stringify(matches, null, 2)}</div>
                    </CardContent>
                  </GlassCard>
                </div>
              </TabsContent>

              <TabsContent value="lines" className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={lineFilterKeep} onCheckedChange={setLineFilterKeep} id="keep" />
                    <Label htmlFor="keep">Keep matching lines</Label>
                  </div>
                  <div className="text-xs text-muted-foreground">Toggle to switch between keep / remove.</div>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
                    {(() => {
                      const rx = buildRegex();
                      if (!rx) return '';
                      const out: string[] = [];
                      for (const line of testText.split(/\n/)) {
                        const ok = rx.test(line);
                        if ((lineFilterKeep && ok) || (!lineFilterKeep && !ok)) out.push(line);
                      }
                      const result = out.join('\n');
                      return result;
                    })()}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="snippet" className="space-y-2">
                <div className="rounded-md border bg-muted/30 p-3">
                  <pre className="font-mono text-xs leading-relaxed">{jsSnippet}</pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={async () => {
                    await navigator.clipboard.writeText(jsSnippet);
                    setCopied('result');
                    setTimeout(() => setCopied(null), 1200);
                  }}>
                  <Code className="h-4 w-4" /> Copy snippet
                </Button>
              </TabsContent>

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
                      <code>(?&lt;name&gt;…)</code> — named capture; use <code>$$&lt;name&gt;</code> in replace
                    </li>
                    <li>
                      <code>
                        x{'{'}n{','}m{'}'}
                      </code>{' '}
                      — quantifier; beware of catastrophic backtracking
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={copyResult}>
              {copied === 'result' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Current View
            </Button>
          </CardFooter>
        </GlassCard>
      </div>
    </MotionGlassCard>
  );
}
