"use client";

import {
  LayoutGrid,
  Link2,
  Plus,
  Regex as RegexIcon,
  Save,
  Sparkles,
  Trash2,
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
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Types & data
type Pattern = {
  id: string;
  title: string;
  description: string;
  pattern: string;
  flags?: string;
  category: (typeof CATEGORIES)[number];
  sample?: string;
};

const CATEGORIES = ["All", "Web", "Numbers", "Security", "System", "Text", "Bangla"] as const;

const LIBRARY: Pattern[] = [
  // Web
  {
    id: "email",
    title: "Email (simple, practical)",
    description: "Basic RFC-lite email matcher for most use cases.",
    pattern: String.raw`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}`,
    flags: "g",
    category: "Web",
    sample: "hello@example.com, admin@mail.io",
  },
  {
    id: "url",
    title: "URL (http/https)",
    description: "Matches common http/https URLs with optional query/hash.",
    pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*`,
    flags: "gi",
    category: "Web",
    sample: "Visit https://tariqul.dev or http://example.org?q=1#top",
  },
  {
    id: "slug",
    title: "Slug (kebab-case)",
    description: "Lowercase letters, digits and hyphens.",
    pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`,
    flags: "",
    category: "Web",
    sample: "projects, my-project-01",
  },
  {
    id: "html-tag",
    title: "HTML tag",
    description: "Find HTML tags with attributes.",
    pattern: `<("[^"]*"|'[^']*'|[^'">])*>`,
    flags: "g",
    category: "Web",
    sample: "<div class='box'>Hello</div>",
  },
  {
    id: "youtube-id",
    title: "YouTube Video ID",
    description: "Extract 11-char YouTube video ID from URL.",
    pattern: String.raw`(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})`,
    flags: "i",
    category: "Web",
    sample: "https://youtu.be/abc123XYZ09",
  },

  // Numbers
  {
    id: "integer",
    title: "Integer (signed)",
    description: "Optional leading +/-, then digits.",
    pattern: String.raw`^[+-]?\d+$`,
    flags: "",
    category: "Numbers",
    sample: "-42, 0, +99",
  },
  {
    id: "number",
    title: "Number (int/float)",
    description: "Optional sign, optional decimals.",
    pattern: String.raw`^[+-]?(?:\d+\.?\d*|\.\d+)$`,
    flags: "",
    category: "Numbers",
    sample: "3, -2.5, .75, +10.0",
  },
  {
    id: "currency",
    title: "Currency (BDT style)",
    description: "Digits with optional commas and decimals.",
    pattern: String.raw`^\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?$`,
    flags: "",
    category: "Numbers",
    sample: "1,200,500.00",
  },
  {
    id: "roman-numeral",
    title: "Roman numeral",
    description: "Match Roman numerals up to 3999.",
    pattern: `^(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$`,
    flags: "i",
    category: "Numbers",
    sample: "XIV, MMXXV",
  },
  {
    id: "percentage",
    title: "Percentage (0-100%)",
    description: "Number between 0–100 with % sign.",
    pattern: String.raw`^(100(\.0+)?|[0-9]?\d(\.\d+)?)%$`,
    flags: "",
    category: "Numbers",
    sample: "25%, 99.5%, 100%",
  },

  // Security
  {
    id: "strong-password",
    title: "Strong password (8+ with mix)",
    description: "At least 8 chars, upper, lower, number, symbol.",
    pattern: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$`,
    flags: "",
    category: "Security",
    sample: "Aa1!aaaa",
  },
  {
    id: "hex-color",
    title: "Hex color (#RGB/#RRGGBB)",
    description: "3 or 6 hex digits after #.",
    pattern: `^#(?:[0-9a-fA-F]{3}){1,2}$`,
    flags: "",
    category: "Security",
    sample: "#0fa, #0F0F0F",
  },
  {
    id: "jwt-token",
    title: "JWT token",
    description: "Three base64url encoded parts separated by dots.",
    pattern: String.raw`^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$`,
    flags: "",
    category: "Security",
    sample: "eyJhbGciOi...abc.def.ghi",
  },

  // System
  {
    id: "uuid-v4",
    title: "UUID v4",
    description: "Canonical lowercase/uppercase variants.",
    pattern: `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`,
    flags: "",
    category: "System",
    sample: "123e4567-e89b-12d3-a456-426614174000",
  },
  {
    id: "ipv4",
    title: "IPv4 address",
    description: "0–255 dot-separated quads.",
    pattern: String.raw`^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$`,
    flags: "",
    category: "System",
    sample: "192.168.0.1",
  },
  {
    id: "ipv6",
    title: "IPv6 address",
    description: "Matches most IPv6 formats.",
    pattern: `^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::1)|::)$`,
    flags: "i",
    category: "System",
    sample: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  },
  {
    id: "mac-address",
    title: "MAC address",
    description: "6 pairs of hex digits separated by : or -.",
    pattern: `^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$`,
    flags: "",
    category: "System",
    sample: "00:1A:2B:3C:4D:5E",
  },

  // Text
  {
    id: "trim-spaces",
    title: "Trim extra spaces (find)",
    description: "Multiple spaces for replacement.",
    pattern: String.raw`\s{2,}`,
    flags: "g",
    category: "Text",
    sample: "hello   world",
  },
  {
    id: "words",
    title: "Words (ASCII)",
    description: "Word tokens split.",
    pattern: String.raw`\b\w+\b`,
    flags: "g",
    category: "Text",
    sample: "This is a test.",
  },
  {
    id: "hashtags",
    title: "Hashtags",
    description: "Find #hashtags in text.",
    pattern: String.raw`#\w+`,
    flags: "g",
    category: "Text",
    sample: "Loving #ToolsCube and #regex",
  },
  {
    id: "mentions",
    title: "Mentions (@username)",
    description: "Find Twitter/Instagram style mentions.",
    pattern: String.raw`@\w+`,
    flags: "g",
    category: "Text",
    sample: "Thanks @tariqul_dev",
  },

  // Bangla
  {
    id: "bd-mobile",
    title: "Bangladesh mobile (+880 / 01)",
    description: "Typical Bangladeshi mobile formats.",
    pattern: String.raw`^(?:\+?88)?01[3-9]\d{8}$`,
    flags: "",
    category: "Bangla",
    sample: "+8801712345678, 01712345678",
  },
  {
    id: "bangla-letters",
    title: "Bangla letters",
    description: "Matches Bangla letters (একাধিক).",
    pattern: String.raw`[\u0980-\u09FF]+`,
    flags: "g",
    category: "Bangla",
    sample: "আমার সোনার বাংলা",
  },
  {
    id: "bangla-number",
    title: "Bangla numbers",
    description: "০–৯ বাংলা সংখ্যা match করে।",
    pattern: `[০-৯]+`,
    flags: "g",
    category: "Bangla",
    sample: "১২৩৪৫৬৭৮৯০",
  },
];

// ---------- Helpers ----------
const FLAG_KEYS = ["g", "i", "m", "s", "u", "y"] as const;
type FlagKey = (typeof FLAG_KEYS)[number];
type Flags = Record<FlagKey, boolean>;

const INITIAL_FLAGS: Flags = { g: true, i: true, m: false, s: false, u: false, y: false };

function escapeForDisplay(src: string) {
  return src.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function safeWindow(): (Window & typeof globalThis) | undefined {
  return typeof window !== "undefined" ? window : undefined;
}

function buildRegex(src: string, flags: string) {
  try {
    return { re: new RegExp(src, flags), error: null as string | null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid regex";
    return { re: null as RegExp | null, error: msg };
  }
}

type MatchRow = { match: string; index: number; groups?: Record<string, string | undefined> };

// Robust matcher that handles zero-length matches
function collectMatches(text: string, re: RegExp | null): MatchRow[] {
  if (!re || !text) return [];

  const g: RegExp = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  const rows: MatchRow[] = [];

  for (;;) {
    const m = g.exec(text);
    if (m === null) break;

    rows.push({
      match: m[0] ?? "",
      index: m.index ?? -1,
      groups: m.groups ?? undefined,
    });

    if (m[0] === "") {
      const next = (m.index ?? 0) + 1;
      g.lastIndex = next;
      if (next >= text.length) break;
    }
  }

  return rows;
}

function encodeShare(p: { pattern: string; flags: string; text: string; replace: string }) {
  const payload = new URLSearchParams({
    re: p.pattern,
    f: p.flags,
    t: p.text,
    r: p.replace,
  }).toString();
  return `?${payload}`;
}
function decodeShare(search: string) {
  const sp = new URLSearchParams(search);
  return {
    pattern: sp.get("re") ?? "",
    flags: sp.get("f") ?? "",
    text: sp.get("t") ?? "",
    replace: sp.get("r") ?? "",
  };
}

export default function RegexLibraryClient() {
  // Search & filter
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<"All" | Pattern["category"]>("All");

  // Tester state
  const [pattern, setPattern] = React.useState<string>(LIBRARY[0].pattern);
  const [flags, setFlags] = React.useState<Flags>(INITIAL_FLAGS);
  const [testText, setTestText] = React.useState<string>(LIBRARY[0].sample ?? "");
  const [replace, setReplace] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [runMs, setRunMs] = React.useState<number | null>(null);

  // Favorites
  type Fav = { id: string; title: string; pattern: string; flags: string };
  const [favs, setFavs] = React.useState<Fav[]>([]);

  // Quick inserts
  const QUICK = React.useMemo(
    () => [
      { label: "Digits (\\d+)", value: String.raw`\d+` },
      { label: "Word (\\w+)", value: String.raw`\w+` },
      { label: "Whitespace (\\s+)", value: String.raw`\s+` },
      { label: "Start ^", value: "^" },
      { label: "End $", value: "$" },
      { label: "Word boundary \\b", value: String.raw`\b` },
      { label: "Group ()", value: "($1)" },
      { label: "Named (?<name>)", value: `(?<name>...)` },
    ],
    [],
  );

  // Parse share URL on mount
  React.useEffect(() => {
    const w = safeWindow();
    if (!w) return;
    const { pattern: ps, flags: fs, text: ts, replace: rs } = decodeShare(w.location.search);
    if (ps || fs || ts || rs) {
      setPattern(ps || LIBRARY[0].pattern);

      const next: Flags = { g: false, i: false, m: false, s: false, u: false, y: false };
      for (const ch of fs || "") {
        if (FLAG_KEYS.includes(ch as FlagKey)) next[ch as FlagKey] = true;
      }
      setFlags(next);

      setTestText(ts || "");
      setReplace(rs || "");
    }
  }, []);

  // Load favorites
  React.useEffect(() => {
    const w = safeWindow();
    if (!w) return;
    try {
      const saved = w.localStorage.getItem("regex-favs");
      if (saved) setFavs(JSON.parse(saved) as Fav[]);
    } catch {}
  }, []);
  const saveFavs = React.useCallback((list: Fav[]) => {
    const w = safeWindow();
    setFavs(list);
    if (!w) return;
    try {
      w.localStorage.setItem("regex-favs", JSON.stringify(list));
    } catch {}
  }, []);

  const flagsStr = React.useMemo(() => FLAG_KEYS.filter((f) => flags[f]).join(""), [flags]);

  // Build regex & measure compile time
  const { re, error: buildErr } = React.useMemo(() => {
    const t0 = performance.now();
    const out = buildRegex(pattern, flagsStr);
    setRunMs(performance.now() - t0);
    return out;
  }, [pattern, flagsStr]);

  React.useEffect(() => {
    setError(buildErr);
  }, [buildErr]);

  // Not a hook — regular handler
  function applyInTester(item: Pattern) {
    setPattern(item.pattern);
    const next: Flags = { g: false, i: false, m: false, s: false, u: false, y: false };
    for (const f of item.flags ?? "") {
      if (FLAG_KEYS.includes(f as FlagKey)) next[f as FlagKey] = true;
    }
    setFlags(next);
    setTestText(item.sample ?? "");
    safeWindow()?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetTester() {
    setPattern("");
    setFlags({ g: true, i: false, m: false, s: false, u: false, y: false });
    setTestText("");
    setReplace("");
    setError(null);
  }

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LIBRARY.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.pattern.toLowerCase().includes(needle)
      );
    });
  }, [q, cat]);

  const matches = React.useMemo(() => collectMatches(testText, re), [testText, re]);

  const replaced = React.useMemo(() => {
    if (!re || !testText) return "";
    try {
      const gg = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
      return testText.replace(gg, replace);
    } catch {
      return "";
    }
  }, [re, testText, replace]);

  function addFavorite() {
    const title = prompt("Save as (title)?", pattern.slice(0, 32) || "Untitled");
    if (!title) return;
    const id = `${Date.now()}`;
    const next = [...favs, { id, title, pattern, flags: flagsStr }];
    saveFavs(next);
  }
  function applyFavorite(f: Fav) {
    setPattern(f.pattern);
    const next: Flags = { g: false, i: false, m: false, s: false, u: false, y: false };
    for (const ch of f.flags) {
      if (FLAG_KEYS.includes(ch as FlagKey)) next[ch as FlagKey] = true;
    }
    setFlags(next);
  }
  function removeFavorite(id: string) {
    const next = favs.filter((f) => f.id !== id);
    saveFavs(next);
  }

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={RegexIcon}
        title="Regex Library"
        description="Collection of useful regular expressions"
        actions={
          <>
            <ResetButton onClick={resetTester} />
            <CopyButton
              icon={Link2}
              label="Share"
              getText={() => {
                const w = safeWindow();
                if (!w) return;
                return (
                  w.location.origin +
                  w.location.pathname +
                  encodeShare({ pattern, flags: flagsStr, text: testText, replace })
                );
              }}
            />
            <ActionButton icon={Save} label="Save Favorite" onClick={addFavorite} />
          </>
        }
      />

      {/* Tester */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Regex Tester</CardTitle>
          <CardDescription>
            Edit the pattern, toggle flags, and see live matches highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                  /
                </span>
                <InputField
                  id="pattern"
                  placeholder="your-regex-here"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="font-mono"
                />
                <span className="rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                  /
                </span>
                <InputField
                  aria-label="flags"
                  value={flagsStr}
                  onChange={(e) => {
                    const next: Flags = {
                      g: false,
                      i: false,
                      m: false,
                      s: false,
                      u: false,
                      y: false,
                    };
                    const v = e.target.value.replace(/[^gimsuy]/g, "");
                    for (const ch of v)
                      if (FLAG_KEYS.includes(ch as FlagKey)) next[ch as FlagKey] = true;
                    setFlags(next);
                  }}
                  className="w-24 font-mono"
                />
                <span className="ml-auto text-xs text-muted-foreground">
                  {runMs ? `${runMs.toFixed(2)}ms` : "—"}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-6 gap-2 sm:grid-cols-6">
                {FLAG_KEYS.map((k) => (
                  <ActionButton
                    key={k}
                    size="sm"
                    label={k}
                    onClick={() => setFlags((f) => ({ ...f, [k]: !f[k] }))}
                    variant={flags[k] ? "default" : "outline"}
                  />
                ))}
              </div>
              {error ? (
                <p className="text-xs text-destructive">Error: {error}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Flags: {flagsStr || "—"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Quick inserts</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK.map((qk) => (
                  <ActionButton
                    key={qk.label}
                    label={qk.label}
                    size="sm"
                    onClick={() => setPattern((p) => p + qk.value)}
                  />
                ))}
              </div>
            </div>

            <TextareaField
              id="test"
              label="Test Text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="min-h-[140px] font-mono"
              placeholder="Paste or type text to test…"
            />

            <InputField
              id="replace"
              label="Replace"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Use $1, $<name> etc."
              className="font-mono"
              hint={
                <p className="text-xs text-muted-foreground">
                  Supports capture groups and named groups. Example:{" "}
                  <code className="font-mono">Hello, $1</code> or{" "}
                  <code className="font-mono">$&</code>.
                </p>
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Preview (matches highlighted)</Label>
              <div className="flex gap-2">
                <CopyButton size="sm" label="Copy Regex" getText={`/${pattern}/${flagsStr}`} />
                <ExportTextButton
                  size="sm"
                  label="Matches JSON"
                  filename="regex-matches.json"
                  getText={() => JSON.stringify(matches, null, 2)}
                />
              </div>
            </div>
            <div className="min-h-[140px] rounded-md border p-3 text-sm leading-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {highlightMatches(testText, re)}
              </div>
            </div>

            {!error && re && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge>
                  source: <span className="font-mono ml-1">/{escapeForDisplay(re.source)}/</span>
                </Badge>
                <Badge>flags: {re.flags || "—"}</Badge>
                <Badge>matches: {matches.length}</Badge>
              </div>
            )}

            <TextareaField
              label="Replace Result"
              readOnly
              value={replaced}
              className="min-h-[120px] font-mono"
              placeholder="Replaced text will appear here…"
            />

            {/* Matches table-ish */}
            <div className="space-y-2">
              <Label>Matches Inspector</Label>
              <div className="max-h-64 overflow-auto rounded-md border">
                {matches.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No matches.</div>
                ) : (
                  <div className="divide-y">
                    {matches.map((m, i) => (
                      <div
                        key={i as number}
                        className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-12 sm:gap-3"
                      >
                        <div className="sm:col-span-3">
                          <div className="text-[11px] text-muted-foreground">Match #{i + 1}</div>
                          <div className="font-mono text-sm break-words">{m.match}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-[11px] text-muted-foreground">Index</div>
                          <div className="text-sm">{m.index}</div>
                        </div>
                        <div className="sm:col-span-7">
                          <div className="text-[11px] text-muted-foreground">Groups</div>
                          {m.groups ? (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(m.groups).map(([k, v]) => (
                                <Badge key={k} variant="secondary" className="font-mono">
                                  {k}: {v ?? "—"}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">—</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Library controls */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div className="text-sm text-muted-foreground">Hand-picked patterns, ready to copy.</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <InputField
            placeholder="Search patterns…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />

          <SelectField
            id="category"
            icon={LayoutGrid}
            label="Category"
            placeholder="All"
            className="w-44"
            value={cat}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            onValueChange={(v) => setCat((v as (typeof CATEGORIES)[number]) ?? "All")}
          />
        </div>
      </GlassCard>

      {/* Library grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
        {filtered.map((item) => (
          <GlassCard key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border bg-muted/50 p-2">
                <code className="whitespace-pre-wrap break-words text-sm">
                  /{escapeForDisplay(item.pattern)}/{item.flags || ""}
                </code>
              </div>
              {item.sample && (
                <div className="rounded-md border p-2">
                  <div className="mb-1 text-xs text-muted-foreground">Sample</div>
                  <div className="text-sm font-mono">{item.sample}</div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <CopyButton size="sm" getText={`/${item.pattern}/${item.flags ?? ""}`} />
                <ActionButton
                  size="sm"
                  icon={Wand2}
                  label="Use in Tester"
                  className="gap-2"
                  onClick={() => applyInTester(item)}
                />
              </div>
            </CardContent>
          </GlassCard>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Favorites */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Favorites</CardTitle>
          <CardDescription>Save and reuse your most common patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          {favs.length === 0 ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              No favorites yet. Click <em>Save Favorite</em> above to store the current pattern.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {favs.map((f) => (
                <div key={f.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">{f.title}</div>
                    <div className="flex gap-1">
                      <ActionButton size="icon" icon={Plus} onClick={() => applyFavorite(f)} />
                      <CopyButton
                        size="icon"
                        label=""
                        copiedLabel=""
                        getText={`/${f.pattern}/${f.flags}`}
                      />
                      <ActionButton
                        size="icon"
                        icon={Trash2}
                        variant="destructive"
                        onClick={() => removeFavorite(f.id)}
                      />
                    </div>
                  </div>
                  <div className="rounded-md border bg-muted/50 p-2 text-sm font-mono">
                    /{escapeForDisplay(f.pattern)}/{f.flags}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Cheatsheet */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Regex Cheatsheet</CardTitle>
          <CardDescription>Common tokens, anchors & quantifiers (JS flavor).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Anchors</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <code className="font-mono">^</code> start of string
              </li>
              <li>
                <code className="font-mono">$</code> end of string
              </li>
              <li>
                <code className="font-mono">\b</code> word boundary
              </li>
            </ul>
          </div>
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Character Classes</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <code className="font-mono">\d</code> digit, <code className="font-mono">\w</code>{" "}
                word, <code className="font-mono">\s</code> whitespace
              </li>
              <li>
                <code className="font-mono">.</code> any char (except newline unless{" "}
                <code className="font-mono">s</code>)
              </li>
              <li>
                <code className="font-mono">[abc]</code> set,{" "}
                <code className="font-mono">[^abc]</code> negated
              </li>
            </ul>
          </div>
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-2">Groups & Quantifiers</div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <code className="font-mono">( )</code> capture,{" "}
                <code className="font-mono">(?: )</code> non-capture
              </li>
              <li>
                <code className="font-mono">(?&lt;name&gt; )</code> named capture
              </li>
              <li>
                <code className="font-mono">?</code>, <code className="font-mono">*</code>,{" "}
                <code className="font-mono">+</code>, <code className="font-mono">{"{m,n}"}</code>{" "}
                (add <code className="font-mono">?</code> for lazy)
              </li>
            </ul>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

// ---------- View helper ----------
function highlightMatches(text: string, re: RegExp | null) {
  if (!re || !text) return <>{text}</>;

  const g: RegExp = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (;;) {
    const m = g.exec(text);
    if (m === null) break;

    const start = m.index ?? 0;
    const end = start + (m[0]?.length ?? 0);

    if (start > last) {
      parts.push(<span key={`t-${last}`}>{text.slice(last, start)}</span>);
    }

    parts.push(
      <mark key={`m-${start}-${end}`} className="rounded px-0.5 py-0.5 ring-1 ring-primary/20">
        {text.slice(start, end)}
      </mark>,
    );

    last = end;

    if (m[0] === "") {
      const next = start + 1;
      g.lastIndex = next;
      last = next;
      if (next >= text.length) break;
    }
  }

  if (last < text.length) {
    parts.push(<span key="t-end">{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}
