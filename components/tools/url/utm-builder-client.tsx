'use client';

import { CopyButton } from '@/components/shared/copy-button';
import { InputField } from '@/components/shared/form-fields/input-field';
import TextareaField from '@/components/shared/form-fields/textarea-field';
import ToolPageHeader from '@/components/shared/tool-page-header';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ClipboardList, Download, Eraser, History, Link2, Plus, RotateCcw, Save, Share2, Trash2, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/* Constants */
const DEFAULT_UTM: UTMState = {
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: '',
  id: '',
  custom: [],
};
const DEFAULT_OPTS: OptionsState = {
  keepExisting: true,
  encodeParams: true,
  lowercaseKeys: true,
  prefixCustomWithUTM: false,
  batchMode: false,
};
const PRESET_LS_KEY = 'utm-builder-presets-v1';
const HISTORY_LS_KEY = 'utm-builder-history-v1';

/* Helpers */
function rid(prefix = 'row') {
  return `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
}
function encodeVal(v: string, should: boolean) {
  return should ? encodeURIComponent(v) : v;
}
function cleanBaseUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const u = new URL(trimmed);
    return `${u.origin}${u.pathname}${u.hash ?? ''}`;
  } catch {
    try {
      const u = new URL(`https://${trimmed}`);
      return `${u.origin}${u.pathname}${u.hash ?? ''}`;
    } catch {
      return trimmed;
    }
  }
}
function parseExisting(url: string) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    const p = u.searchParams;
    const out: Partial<UTMState> = {};
    const get = (k: string) => p.get(k) ?? '';
    out.source = get('utm_source');
    out.medium = get('utm_medium');
    out.campaign = get('utm_campaign');
    out.term = get('utm_term');
    out.content = get('utm_content');
    out.id = get('utm_id');

    const custom: Pair[] = [];
    p.forEach((v, k) => {
      if (!k.startsWith('utm_')) custom.push({ id: rid('pair'), key: k, value: v, enabled: true });
    });

    return { utm: { ...(DEFAULT_UTM as UTMState), ...(out as UTMState), custom }, baseNoQuery: cleanBaseUrl(url) };
  } catch {
    return null;
  }
}
function genShortId() {
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2, 10);
}
function isValidUrl(s: string) {
  try {
    new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return true;
  } catch {
    return false;
  }
}
function buildSingle(baseUrl: string, utm: UTMState, opts: OptionsState) {
  if (!baseUrl || !baseUrl.trim()) return '';

  let base = baseUrl.trim();
  if (!/^https?:\/\//i.test(base)) base = `https://${base}`;

  let u: URL;
  try {
    u = new URL(base);
    if (!u.hostname) return '';
  } catch {
    return '';
  }

  const params = new URLSearchParams(opts.keepExisting ? u.search : '');

  const key = (k: string) => (opts.lowercaseKeys ? k.toLowerCase() : k);
  const set = (k: string, v: string) => {
    if (!v) return;
    params.set(key(k), encodeVal(v, opts.encodeParams));
  };

  set('utm_source', utm.source);
  set('utm_medium', utm.medium);
  set('utm_campaign', utm.campaign);
  set('utm_term', utm.term);
  set('utm_content', utm.content);
  set('utm_id', utm.id);

  for (const c of utm.custom) {
    if (!c.enabled || !c.key) continue;
    const k = opts.prefixCustomWithUTM ? `utm_${c.key.replace(/^utm_/i, '')}` : c.key;
    set(k, c.value);
  }

  u.search = params.toString();
  return u.toString();
}
function csvDownload(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const v = (cell ?? '').toString().replace(/"/g, '""');
          return /[",]/.test(v) ? `"${v}"` : v;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Component */

export default function UTMBuilderClient() {
  // base / batch
  const [baseUrl, setBaseUrl] = useState('');
  const [batchList, setBatchList] = useState('');

  // utm + options
  const [utm, setUtm] = useState<UTMState>({ ...DEFAULT_UTM });
  const [opts, setOpts] = useState<OptionsState>({ ...DEFAULT_OPTS });

  // presets
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // results
  const result = useMemo(() => buildSingle(baseUrl, utm, opts), [baseUrl, utm, opts]);
  const resultBatch = useMemo(() => {
    if (!opts.batchMode) return [] as string[];
    const lines = batchList
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((b) => buildSingle(b, utm, opts)).filter(Boolean);
  }, [batchList, utm, opts]);

  const requiredMissing = useMemo(() => {
    const miss: string[] = [];
    if (!utm.source) miss.push('source');
    if (!utm.medium) miss.push('medium');
    if (!utm.campaign) miss.push('campaign');
    return miss;
  }, [utm.source, utm.medium, utm.campaign]);

  // Load presets
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PRESET_LS_KEY) || '[]') as Preset[];
      setPresets(Array.isArray(p) ? p : []);
    } catch {}
  }, []);

  /* Actions */
  function resetAll() {
    setBaseUrl('');
    setBatchList('');
    setUtm({ ...DEFAULT_UTM });
    setOpts({ ...DEFAULT_OPTS });
    setSelectedPreset('');
  }

  function addCustomRow() {
    setUtm((u) => ({ ...u, custom: [...u.custom, { id: rid('pair'), key: '', value: '', enabled: true }] }));
  }
  function removeCustomRow(id: string) {
    setUtm((u) => ({ ...u, custom: u.custom.filter((c) => c.id !== id) }));
  }
  function updateCustomRow(id: string, patch: Partial<Pair>) {
    setUtm((u) => ({
      ...u,
      custom: u.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function autoFillId() {
    setUtm((u) => ({ ...u, id: `ns-${genShortId()}` }));
  }

  function importFromUrl() {
    const parsed = parseExisting(baseUrl);
    if (!parsed) return;
    setUtm(parsed.utm);
    setBaseUrl(parsed.baseNoQuery);
  }

  function savePreset() {
    const name = prompt('Preset name?');
    if (!name) return;
    const preset: Preset = { name, utm, options: opts };
    const next = [...presets.filter((p) => p.name !== name), preset];
    setPresets(next);
    localStorage.setItem(PRESET_LS_KEY, JSON.stringify(next));
    setSelectedPreset(name);
  }
  function applyPreset(name: string) {
    const p = presets.find((x) => x.name === name);
    if (!p) return;
    setUtm(p.utm);
    setOpts(p.options);
    setSelectedPreset(name);
  }
  function deletePreset(name: string) {
    const next = presets.filter((p) => p.name !== name);
    setPresets(next);
    localStorage.setItem(PRESET_LS_KEY, JSON.stringify(next));
    if (selectedPreset === name) setSelectedPreset('');
  }

  function exportPresets() {
    const rows = JSON.stringify(presets, null, 2);
    const blob = new Blob([rows], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utm-presets.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importPresetsFromFiles(files: File[] | null) {
    const f = files?.[0];
    if (!f) return;
    const text = await f.text();
    try {
      const next = JSON.parse(text);
      if (Array.isArray(next)) {
        setPresets(next);
        localStorage.setItem(PRESET_LS_KEY, JSON.stringify(next));
      }
    } catch {}
  }

  function exportBatchCSV() {
    if (!resultBatch.length) return;
    const src = batchList
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const rows: string[][] = [['Base URL', 'Result URL'], ...resultBatch.map((r, i) => [src[i] ?? '', r])];
    csvDownload('utm-batch.csv', rows);
  }

  const canBuildSingle = baseUrl && isValidUrl(baseUrl) && !opts.batchMode;

  return (
    <MotionGlassCard>
      {/* Header */}
      <ToolPageHeader
        icon={Link2}
        title="UTM Builder"
        description="Create campaign UTM parameters fast"
        actions={
          <>
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={savePreset} className="gap-2">
              <Save className="h-4 w-4" /> Save Preset
            </Button>

            <InputField type="file" accept="application/json" onFilesChange={importPresetsFromFiles} fileButtonLabel="Import" />

            <Button variant="outline" onClick={exportPresets} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {/* Base & Options */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Base URL</CardTitle>
          <CardDescription>Paste a destination URL. You can also import existing UTM parameters from a URL.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div className="flex gap-2">
              <InputField id="base-url" placeholder="https://example.com/landing" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="flex-1" />
              <Button variant="outline" className="gap-2" onClick={importFromUrl} disabled={!isValidUrl(baseUrl)}>
                <ClipboardList className="h-4 w-4" /> Import from URL
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={opts.batchMode} onCheckedChange={(v) => setOpts((o) => ({ ...o, batchMode: Boolean(v) }))} />
              <Label className="text-sm">Batch Mode</Label>
            </div>
          </div>

          {opts.batchMode && (
            <TextareaField
              id="batch-urls"
              label="Batch URLs (one per line)"
              placeholder={`https://example.com\nhttps://tariqul.dev/blog/article`}
              value={batchList}
              onValueChange={setBatchList}
              textareaClassName="min-h-[120px] font-mono"
              rows={6}
              autoResize
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleRow
              title="Keep existing query params"
              subtitle="Preserve current ?a=b params on your base URL."
              checked={opts.keepExisting}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, keepExisting: Boolean(v) }))}
            />
            <ToggleRow
              title="URL-encode parameter values"
              subtitle="Spaces and special characters will be encoded."
              checked={opts.encodeParams}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, encodeParams: Boolean(v) }))}
            />
            <ToggleRow title="Lowercase keys" subtitle="Enforce utm_* keys in lowercase." checked={opts.lowercaseKeys} onCheckedChange={(v) => setOpts((o) => ({ ...o, lowercaseKeys: Boolean(v) }))} />
            <ToggleRow
              title="Prefix custom keys with utm_"
              subtitle="Example: channel → utm_channel"
              checked={opts.prefixCustomWithUTM}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, prefixCustomWithUTM: Boolean(v) }))}
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* UTM Params */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">UTM Parameters</CardTitle>
          <CardDescription>Fill the core fields. Missing required ones are highlighted.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <InputField id="utm_source" label="utm_source *" value={utm.source} onChange={(e) => setUtm((u) => ({ ...u, source: e.target.value }))} />
            <InputField id="utm_medium" label="utm_medium *" value={utm.medium} onChange={(e) => setUtm((u) => ({ ...u, medium: e.target.value }))} />
            <InputField id="utm_campaign" label="utm_campaign *" value={utm.campaign} onChange={(e) => setUtm((u) => ({ ...u, campaign: e.target.value }))} />
            <InputField id="utm_term" label="utm_term" value={utm.term} onChange={(e) => setUtm((u) => ({ ...u, term: e.target.value }))} />
            <InputField id="utm_content" label="utm_content" value={utm.content} onChange={(e) => setUtm((u) => ({ ...u, content: e.target.value }))} />
            <div className="space-y-2">
              <Label htmlFor="utm_id" className="flex items-center justify-between">
                <span>utm_id</span>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={autoFillId}>
                  <Wand2 className="h-4 w-4" /> Auto ID
                </Button>
              </Label>
              <InputField id="utm_id" value={utm.id} onChange={(e) => setUtm((u) => ({ ...u, id: e.target.value }))} />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <div className="text-sm font-medium">Custom parameters</div>
              <Button variant="outline" size="sm" className="gap-2" onClick={addCustomRow}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="divide-y">
              {utm.custom.length === 0 && <div className="p-3 text-sm text-muted-foreground">No custom params.</div>}
              {utm.custom.map((c) => (
                <div key={c.id} className="p-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center">
                  <InputField placeholder="key (e.g., channel)" value={c.key} onChange={(e) => updateCustomRow(c.id, { key: e.target.value })} />
                  <InputField placeholder="value" value={c.value} onChange={(e) => updateCustomRow(c.id, { value: e.target.value })} />
                  <div className="flex items-center gap-2 justify-end">
                    <Switch checked={c.enabled} onCheckedChange={(v) => updateCustomRow(c.id, { enabled: Boolean(v) })} />
                    <span className="text-xs text-muted-foreground">Enable</span>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeCustomRow(c.id)} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {requiredMissing.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm">
              Missing required fields: <strong>{requiredMissing.join(', ')}</strong>
            </div>
          )}
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Output */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Output</CardTitle>
          <CardDescription>Copy the result or open in a new tab. Batch results appear below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!opts.batchMode && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Result URL
              </Label>
              <div className="flex gap-2">
                <InputField readOnly value={result} placeholder="—" className="font-mono flex-1" />
                <CopyButton getText={() => result || ''} />
                <Button variant="outline" className="gap-2" disabled={!result} onClick={() => window.open(result, '_blank', 'noopener')}>
                  <Share2 className="h-4 w-4" /> Open
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {baseUrl && !isValidUrl(baseUrl) && <span className="text-red-500">Invalid base URL.</span>}
                {baseUrl && isValidUrl(baseUrl) && (
                  <>
                    Built with <strong>{utm.custom.filter((c) => c.enabled).length + 6}</strong> params (including core utms).
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!result || requiredMissing.length > 0}
                  onClick={() => {
                    const item: HistoryItem = { ts: Date.now(), base: baseUrl, result };
                    try {
                      const prev = JSON.parse(localStorage.getItem(HISTORY_LS_KEY) || '[]') as HistoryItem[];
                      const next = [item, ...prev].slice(0, 30);
                      localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(next));
                    } catch {}
                  }}
                  variant="outline"
                  className="gap-2">
                  <History className="h-4 w-4" /> Save to History
                </Button>
                <CopyButton label="Copy Config JSON" getText={() => JSON.stringify({ utm, options: opts }, null, 2)} variant="outline" />
              </div>
            </div>
          )}

          {opts.batchMode && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" disabled={!resultBatch.length} onClick={exportBatchCSV}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <CopyButton
                  label="Copy All"
                  getText={() => (resultBatch.length ? resultBatch.join('\n') : '')} // ✅ fixed
                  variant="outline"
                />
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!resultBatch.length}
                  onClick={() => {
                    const item: HistoryItem = { ts: Date.now(), base: baseUrl, result: resultBatch };
                    try {
                      const prev = JSON.parse(localStorage.getItem(HISTORY_LS_KEY) || '[]') as HistoryItem[];
                      const next = [item, ...prev].slice(0, 30);
                      localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(next));
                    } catch {}
                  }}>
                  <History className="h-4 w-4" /> Save Batch to History
                </Button>
              </div>

              <div className={cn('rounded-md border overflow-hidden', resultBatch.length ? '' : 'p-3 text-sm text-muted-foreground')}>
                {!resultBatch.length && 'No batch results yet.'}
                {!!resultBatch.length && (
                  <div className="divide-y">
                    {resultBatch.map((r, i) => (
                      <div key={i} className="p-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">#{i + 1}</div>
                          <div className="mt-1 line-clamp-1 break-all font-mono">{r}</div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <CopyButton getText={() => r} variant="outline" size="sm" />
                          <Button variant="outline" size="sm" onClick={() => window.open(r, '_blank', 'noopener')}>
                            <Share2 className="h-4 w-4" /> Open
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Presets & History */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Presets & Quick Apply</CardTitle>
          <CardDescription>Save and reuse campaign settings for consistency across the team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[260px_1fr] sm:items-start">
            <div className="space-y-2">
              <Label>Choose a preset</Label>
              {/* Standalone Select (no RHF) */}
              <Select value={selectedPreset} onValueChange={applyPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="No preset selected" />
                </SelectTrigger>
                <SelectContent>
                  {presets.length === 0 && <div className="p-2 text-sm text-muted-foreground">No presets yet</div>}
                  {presets.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!!selectedPreset && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => deletePreset(selectedPreset)}>
                    <Eraser className="h-4 w-4" /> Delete Preset
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-md border">
              <div className="px-3 py-2 border-b text-sm font-medium">Recent History</div>
              <HistoryList />
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}

/* ---------- Little subcomponents ---------- */

function ToggleRow({ title, subtitle, checked, onCheckedChange }: { title: string; subtitle: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <Switch checked={checked} onCheckedChange={(v) => onCheckedChange(Boolean(v))} />
    </div>
  );
}

function HistoryList() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const x = JSON.parse(localStorage.getItem(HISTORY_LS_KEY) || '[]') as HistoryItem[];
      setItems(Array.isArray(x) ? x : []);
    } catch {}
  }, []);

  function clearAll() {
    localStorage.removeItem(HISTORY_LS_KEY);
    setItems([]);
  }

  return (
    <div className={cn('divide-y', items.length ? '' : 'p-3 text-sm text-muted-foreground')}>
      {!items.length && 'No history yet.'}
      {items.map((h, i) => (
        <div key={i} className="p-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{new Date(h.ts).toLocaleString()}</div>
            {Array.isArray(h.result) ? <div className="mt-1 text-sm">Batch • {h.result.length} links</div> : <div className="mt-1 line-clamp-1 break-all font-mono">{h.result}</div>}
          </div>
          <div className="flex gap-2 justify-end">
            {Array.isArray(h.result) ? (
              <>
                <CopyButton label="Copy All" getText={() => (h.result as string[]).join('\n')} variant="outline" size="sm" />
                <Button variant="outline" size="sm" onClick={() => csvDownload('utm-history-batch.csv', [['URL'], ...(h.result as string[]).map((r) => [r])])}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </>
            ) : (
              <>
                <CopyButton label="Copy" getText={() => String(h.result)} variant="outline" size="sm" />
                <Button variant="outline" size="sm" onClick={() => window.open(String(h.result), '_blank', 'noopener')}>
                  <Share2 className="h-4 w-4" /> Open
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
      {!!items.length && (
        <div className="p-3 flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={clearAll}>
            <Eraser className="h-4 w-4" /> Clear History
          </Button>
        </div>
      )}
    </div>
  );
}
