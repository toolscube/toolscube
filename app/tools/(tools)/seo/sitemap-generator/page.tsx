"use client";

import {
  AlertTriangle,
  Calendar,
  Download,
  FileCode,
  Files,
  Info,
  Link as LinkIcon,
  ListChecks,
  Settings,
  Wand2,
} from "lucide-react";
import * as React from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* Types */
type ChangeFreq = "" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

type Row = {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: string;
};

type State = {
  // Input
  text: string;
  baseUrl: string;
  keepTrailingSlash: boolean;
  forceHttps: boolean;

  // Defaults
  defaultChangefreq: ChangeFreq;
  defaultPriority: string;
  lastmodMode: "none" | "today" | "fromCSV";
  dateFormat: "iso";

  // Output
  pretty: boolean;
  maxUrlsPerFile: number;
  filename: string;
  makeIndex: boolean;

  // UI
  includeSampleHeaders: boolean;
};

type BuiltFile = { name: string; xml: string; bytes: number };

type Option = { label: React.ReactNode; value: string | number; disabled?: boolean };

/* Defaults */
const DEFAULT: State = {
  text: `https://example.com/
https://example.com/about
/about/team | 2024-12-10 | weekly | 0.6
/blog/my-post,2025-01-20,daily,0.8
/products
`,
  baseUrl: "https://example.com",
  keepTrailingSlash: false,
  forceHttps: true,

  defaultChangefreq: "weekly",
  defaultPriority: "",
  lastmodMode: "fromCSV",
  dateFormat: "iso",

  pretty: true,
  maxUrlsPerFile: 50000,
  filename: "sitemap.xml",
  makeIndex: true,

  includeSampleHeaders: false,
};

/* Select options */
const CHANGEFREQ_OPTIONS: Option[] = [
  { label: "None", value: " " },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const LASTMOD_OPTIONS: Option[] = [
  { label: "None", value: " " },
  { label: "Today", value: "today" },
  { label: "From CSV", value: "fromCSV" },
];

/* Helpers */
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function isAbsolute(url: string) {
  return /^https?:\/\//i.test(url);
}

function ensureAbsolute(url: string, base: string) {
  if (!url) return "";
  if (!isAbsolute(url)) {
    try {
      const u = new URL(url, base);
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

function normalizeUrl(u: string, opts: { keepSlash: boolean; forceHttps: boolean }) {
  try {
    const url = new URL(u);
    if (opts.forceHttps) url.protocol = "https:";
    const isRoot = url.pathname === "" || url.pathname === "/";
    if (!isRoot) {
      if (opts.keepSlash) {
        if (!url.pathname.endsWith("/")) url.pathname += "/";
      } else if (url.pathname.endsWith("/")) {
        url.pathname = url.pathname.replace(/\/+$/, "");
      }
    }
    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = "";
    }
    return url.toString();
  } catch {
    return u.trim();
  }
}

function x(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseLineToRow(line: string, baseUrl: string): Row | null {
  const raw = line.trim();
  if (!raw || raw.startsWith("#")) return null;

  let parts: string[] = [];
  if (raw.includes("|")) parts = raw.split("|").map((s) => s.trim());
  else if (raw.includes(",")) parts = raw.split(",").map((s) => s.trim());
  else parts = [raw];

  const [first, lastmod, changefreq, priority] = parts;
  if (!first) return null;

  const locAbs = ensureAbsolute(first, baseUrl);

  return {
    loc: locAbs,
    lastmod,
    changefreq: (changefreq as ChangeFreq) || undefined,
    priority: priority || undefined,
  };
}

function buildRows(s: State): Row[] {
  const lines = s.text.split(/\r?\n/);
  const rows: Row[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const row = parseLineToRow(line, s.baseUrl);
    if (!row) continue;

    const normalized = normalizeUrl(row.loc, {
      keepSlash: s.keepTrailingSlash,
      forceHttps: s.forceHttps,
    });

    if (!/^https?:\/\//i.test(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    rows.push({
      loc: normalized,
      lastmod: row.lastmod,
      changefreq: row.changefreq,
      priority: row.priority,
    });
  }
  return rows;
}

function clampPriority(p: string) {
  const n = Number(p);
  if (Number.isFinite(n)) {
    const c = Math.max(0, Math.min(1, n));
    return c.toFixed(2);
  }
  return "";
}

function applyDefaults(rows: Row[], s: State): Row[] {
  const out: Row[] = [];
  const today = todayISO();

  for (const r of rows) {
    const rr: Row = { ...r };

    // lastmod
    if (s.lastmodMode === "today") {
      rr.lastmod = today;
    } else if (s.lastmodMode === "fromCSV") {
      if (rr.lastmod && /^\d{4}-\d{2}-\d{2}$/.test(rr.lastmod)) {
        // ok
      } else if (!rr.lastmod) {
        // leave empty
      } else {
        const d = new Date(rr.lastmod);
        if (!Number.isNaN(d.getTime())) rr.lastmod = d.toISOString().slice(0, 10);
        else rr.lastmod = undefined;
      }
    } else {
      rr.lastmod = undefined;
    }

    // changefreq
    rr.changefreq = (rr.changefreq || s.defaultChangefreq || undefined) as ChangeFreq;

    // priority
    const p = (rr.priority ?? s.defaultPriority ?? "").trim();
    rr.priority = p ? clampPriority(p) : undefined;

    out.push(rr);
  }
  return out;
}

function chunk<T>(arr: T[], size: number) {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildSitemapXML(urlset: Row[], pretty: boolean) {
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  const tail = `</urlset>`;

  const urls = urlset.map((r) => {
    const parts = [
      `  <url>`,
      `    <loc>${x(r.loc)}</loc>`,
      ...(r.lastmod ? [`    <lastmod>${x(r.lastmod)}</lastmod>`] : []),
      ...(r.changefreq ? [`    <changefreq>${x(r.changefreq)}</changefreq>`] : []),
      ...(r.priority ? [`    <priority>${x(r.priority)}</priority>`] : []),
      `  </url>`,
    ];
    return parts.join("\n");
  });

  const body = urls.join("\n");
  const raw = `${head}${body ? `${body}\n` : ""}${tail}`;
  return pretty ? `${raw}\n` : raw;
}

function buildIndexXML(parts: { loc: string; lastmod?: string }[], pretty: boolean) {
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  const tail = `</sitemapindex>`;

  const nodes = parts.map((p) => {
    const inner = [
      `  <sitemap>`,
      `    <loc>${x(p.loc)}</loc>`,
      ...(p.lastmod ? [`    <lastmod>${x(p.lastmod)}</lastmod>`] : []),
      `  </sitemap>`,
    ];
    return inner.join("\n");
  });

  const body = nodes.join("\n");
  const raw = `${head}${body ? `${body}\n` : ""}${tail}`;
  return pretty ? `${raw}\n` : raw;
}

function toBytes(s: string) {
  return new TextEncoder().encode(s).length;
}

/* Issues (live checks) */
type Issue = { level: "error" | "warn" | "info"; message: string };

function computeIssues(rows: Row[], s: State, files: BuiltFile[]): Issue[] {
  const issues: Issue[] = [];

  if (!/\.xml$/i.test(s.filename)) {
    issues.push({ level: "warn", message: `Filename "${s.filename}" doesn’t end with .xml.` });
  }

  if (s.baseUrl.trim()) {
    try {
      new URL(s.baseUrl);
    } catch {
      issues.push({
        level: "warn",
        message: `Base URL "${s.baseUrl}" is not a valid absolute URL.`,
      });
    }
  }

  if (rows.length > 50000) {
    issues.push({
      level: "warn",
      message: `Total URLs (${rows.length}) exceed 50,000; output will be split.`,
    });
  }

  const oversized = files.filter((f) => f.bytes > 50 * 1024 * 1024).length;
  if (oversized) {
    issues.push({
      level: "warn",
      message: `${oversized} file(s) exceed 50MB uncompressed. Consider more splits.`,
    });
  }

  if (s.defaultPriority.trim()) {
    const n = Number(s.defaultPriority);
    if (Number.isNaN(n) || n < 0 || n > 1) {
      issues.push({
        level: "warn",
        message: `Default priority "${s.defaultPriority}" is outside 0–1; it will be clamped.`,
      });
    }
  }

  if (s.lastmodMode === "none") {
    issues.push({ level: "info", message: "lastmod is disabled (mode: none)." });
  }

  return issues;
}

/* Component */
export default function SitemapGeneratorClient() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sitemap-gen-v1");
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  React.useEffect(() => {
    localStorage.setItem("sitemap-gen-v1", JSON.stringify(s));
  }, [s]);

  const baseRows = React.useMemo(() => buildRows(s), [s]);
  const rows = React.useMemo(() => applyDefaults(baseRows, s), [baseRows, s]);

  const parts = React.useMemo(() => {
    const max = Math.max(1, Math.min(50000, s.maxUrlsPerFile || 50000));
    const chunks = chunk(rows, max);

    const files: BuiltFile[] = chunks.map((ch, i) => {
      const xml = buildSitemapXML(ch, s.pretty);
      const base = s.filename.replace(/\.xml$/i, "");
      const name = chunks.length === 1 ? s.filename : `${base}-${i + 1}.xml`;
      return { name, xml, bytes: toBytes(xml) };
    });

    if (s.makeIndex && files.length > 1) {
      // Index
      const indexName = `${s.filename.replace(/\.xml$/i, "")}-index.xml`;
      const base = s.baseUrl?.replace(/\/+$/, "");
      const indexEntries = files.map((f) => ({
        loc: base ? `${base}/${f.name}` : f.name,
        lastmod: todayISO(),
      }));
      const indexXML = buildIndexXML(indexEntries, s.pretty);
      files.unshift({ name: indexName, xml: indexXML, bytes: toBytes(indexXML) });
    }

    return files;
  }, [rows, s.pretty, s.maxUrlsPerFile, s.filename, s.makeIndex, s.baseUrl]);

  const preview = parts[0];
  const issues = React.useMemo(() => computeIssues(rows, s, parts), [rows, s, parts]);

  function resetAll() {
    setS(DEFAULT);
  }

  const urlCount = rows.length;
  const fileCount = parts.length;
  const totalBytes = parts.reduce((a, b) => a + b.bytes, 0);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={FileCode}
        title="Sitemap.xml Generator"
        description="Build XML sitemaps from URL lists."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton disabled={!preview} getText={preview?.xml ?? " "} />
            <ExportTextButton
              variant="default"
              disabled={!preview}
              label="Download"
              getText={() => preview?.xml ?? " "}
              filename={preview?.name ?? "sitemap.xml"}
            />
          </>
        }
      />

      {/* Input */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Input URLs</CardTitle>
          <CardDescription>
            One per line (absolute or relative). Optional metadata via{" "}
            <code className="font-mono">|</code> or CSV.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <TextareaField
            label="URLs"
            value={s.text}
            onValueChange={(v) => setS((p) => ({ ...p, text: v }))}
            textareaClassName="font-mono"
            rows={10}
            placeholder={`https://example.com/\n/about | 2025-01-18 | weekly | 0.7\n/blog/post-1,2024-12-20,monthly,0.5`}
          />

          {s.includeSampleHeaders && (
            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              Formats supported:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  <span className="font-mono">/path</span> or{" "}
                  <span className="font-mono">https://domain.com/path</span>
                </li>
                <li>
                  <span className="font-mono">url | lastmod | changefreq | priority</span>
                </li>
                <li>
                  <span className="font-mono">url,lastmod,changefreq,priority</span>
                </li>
                <li>
                  <span className="font-mono">lastmod</span> prefers{" "}
                  <span className="font-mono">YYYY-MM-DD</span>.
                </li>
              </ul>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 items-end">
            <InputField
              id="base"
              icon={LinkIcon}
              label="Base URL (for relative paths)"
              value={s.baseUrl}
              onChange={(e) => setS((p) => ({ ...p, baseUrl: e.target.value.trim() }))}
              placeholder="https://example.com"
            />

            <div className="grid grid-cols-2 gap-3">
              <SwitchRow
                className="h-fit"
                label="Keep trailing slash"
                checked={s.keepTrailingSlash}
                onCheckedChange={(v) => setS((p) => ({ ...p, keepTrailingSlash: v }))}
              />
              <SwitchRow
                className="h-fit"
                label="Force HTTPS"
                checked={s.forceHttps}
                onCheckedChange={(v) => setS((p) => ({ ...p, forceHttps: v }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <ActionButton
              icon={Wand2}
              label="Tips"
              variant="outline"
              onClick={() => setS((p) => ({ ...p, includeSampleHeaders: !p.includeSampleHeaders }))}
            />
            <Badge variant="secondary" className="font-normal">
              Parsed: {baseRows.length} raw → {rows.length} valid
            </Badge>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Defaults & Settings */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Defaults & Settings</CardTitle>
          <CardDescription>Applied where a row doesn’t specify its own values.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {/* Defaults */}
            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Defaults
              </Label>

              <div className="grid gap-3 sm:grid-cols-3 items-end">
                <SelectField
                  id="def-changefreq"
                  label="Change Frequency"
                  placeholder="none"
                  options={CHANGEFREQ_OPTIONS}
                  value={s.defaultChangefreq}
                  onValueChange={(v) =>
                    setS((p) => ({ ...p, defaultChangefreq: (v as ChangeFreq) ?? "" }))
                  }
                />

                <InputField
                  id="prio"
                  label="Priority"
                  value={s.defaultPriority}
                  onChange={(e) => setS((p) => ({ ...p, defaultPriority: e.target.value }))}
                  placeholder="e.g., 0.80"
                />

                <SelectField
                  id="def-lastmod"
                  label="Last Modified"
                  placeholder="none"
                  options={LASTMOD_OPTIONS}
                  value={s.lastmodMode}
                  onValueChange={(v) =>
                    setS((p) => ({ ...p, lastmodMode: (v as State["lastmodMode"]) ?? "none" }))
                  }
                />
              </div>
            </div>

            {/* Output files */}
            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Files className="h-4 w-4" /> Output files
              </Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  id="fname"
                  label="Base filename"
                  value={s.filename}
                  onChange={(e) =>
                    setS((p) => ({ ...p, filename: e.target.value || "sitemap.xml" }))
                  }
                  placeholder="sitemap.xml"
                />
                <InputField
                  id="max"
                  label="Max URLs per file"
                  type="number"
                  value={s.maxUrlsPerFile}
                  onChange={(e) =>
                    setS((p) => ({
                      ...p,
                      maxUrlsPerFile: Math.max(1, Math.min(50000, Number(e.target.value) || 50000)),
                    }))
                  }
                />
              </div>

              <SwitchRow
                label="Create index (sitemapindex)"
                hint="Adds *-index.xml linking all parts."
                checked={s.makeIndex}
                onCheckedChange={(v) => setS((p) => ({ ...p, makeIndex: v }))}
              />

              <SwitchRow
                label="Pretty print"
                hint="Appends a newline; keeps layout readable."
                checked={s.pretty}
                onCheckedChange={(v) => setS((p) => ({ ...p, pretty: v }))}
              />
            </div>
          </div>

          {/* Stats, Issues & Quick Actions */}
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <ListChecks className="h-3.5 w-3.5" /> URLs: {urlCount}
                </Badge>
                <Badge variant="outline">Files: {fileCount}</Badge>
                <Badge variant="outline">{(totalBytes / 1024).toFixed(1)} KB total</Badge>
                <Badge variant="outline">{rows.filter((r) => r.lastmod).length} lastmod</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Limits: max 50,000 URLs or 50MB per file (uncompressed).
              </p>
            </div>

            {issues.length > 0 && (
              <div className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Issues</Label>
                    <p className="text-xs text-muted-foreground">
                      Live checks based on your input.
                    </p>
                  </div>
                  <Badge variant="outline">{issues.length}</Badge>
                </div>

                <ul className="space-y-1">
                  {issues.map((it, i) => (
                    <li key={i as number} className="flex items-start gap-2 text-sm">
                      {it.level === "error" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      ) : it.level === "warn" ? (
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <span
                        className={
                          it.level === "error"
                            ? "text-red-700"
                            : it.level === "warn"
                              ? "text-orange-700"
                              : "text-muted-foreground"
                        }
                      >
                        {it.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parts.length > 0 && (
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Download all</Label>
                    <p className="text-xs text-muted-foreground">
                      Each part as a separate XML file.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parts.map((f, i) => (
                      <ExportTextButton
                        key={f.name + (i as number)}
                        size="sm"
                        variant="default"
                        icon={Download}
                        label={f.name}
                        filename={f.name}
                        getText={() => f.xml}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Tips</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use absolute URLs where possible. Relative paths are resolved against{" "}
                  <span className="font-mono">{s.baseUrl || "your base URL"}</span>.
                </li>
                <li>
                  Provide <span className="font-mono">lastmod</span> as{" "}
                  <span className="font-mono">YYYY-MM-DD</span> for best compatibility.
                </li>
                <li>Submit the index file to search engines if you split into parts.</li>
                <li>Don’t include non-canonical or blocked (robots) URLs.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Preview */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>First file’s XML. Copy or download each file above.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <TextareaField
              readOnly
              rows={16}
              textareaClassName="font-mono text-sm"
              value={preview ? preview.xml : "<urlset />"}
            />
            <div className="flex flex-wrap gap-2">
              <CopyButton size="sm" disabled={!preview} getText={preview?.xml ?? ""} />
              <ExportTextButton
                variant="default"
                size="sm"
                icon={Download}
                label="Download"
                getText={() => preview?.xml ?? ""}
                filename={preview?.name ?? ""}
              />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Validation checklist</Label>
                <p className="text-xs text-muted-foreground">
                  Quick sanity checks for common issues.
                </p>
              </div>
              <Badge variant="secondary">XML</Badge>
            </div>

            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>
                URLs start with <code>http(s)://</code> and point to the final canonical location.
              </li>
              <li>No more than 50,000 URLs per file; each file ≤ 50MB.</li>
              <li>
                <code>lastmod</code> uses <code>YYYY-MM-DD</code> and reflects actual updates.
              </li>
              <li>
                Use a <code>sitemapindex</code> if you have multiple sitemap parts.
              </li>
              <li>
                Reference your sitemap(s) in <code>robots.txt</code> for discovery.
              </li>
            </ul>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-4 w-4" />
                Generated: {todayISO()}
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
