"use client";

import {
  ActivitySquare,
  Check,
  Clock4,
  Copy,
  Download,
  History,
  Link2,
  Loader2,
  Network,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ---------- Types ----------
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type Pair = { id: string; key: string; value: string; enabled: boolean };
type BodyMode = "none" | "json" | "text" | "form" | "multipart";

type Preset = {
  id: string;
  title: string;
  method: Method;
  url: string;
  query: Pair[];
  headers: Pair[];
  auth: {
    type: "none" | "bearer" | "basic";
    bearer?: string;
    basicUser?: string;
    basicPass?: string;
  };
  bodyMode: BodyMode;
  bodyText: string;
  form: Pair[];
  multipart: Pair[];
};

type HistoryItem = Omit<Preset, "id" | "title"> & {
  id: string;
  when: string;
  status?: number;
  ms?: number;
};

// ---------- Helpers ----------
const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const uid = () => Math.random().toString(36).slice(2, 9);

const w = () => (typeof window !== "undefined" ? window : undefined);
const ls = () => (typeof window !== "undefined" ? window.localStorage : undefined);

function kvToObject(pairs: Pair[], includeDisabled = false) {
  const out: Record<string, string> = {};
  for (const p of pairs) {
    if (!p.key) continue;
    if (!includeDisabled && !p.enabled) continue;
    out[p.key] = p.value;
  }
  return out;
}
function filterEnabled(pairs: Pair[]) {
  return pairs.filter((p) => p.enabled && p.key);
}
function parseJSONMaybe(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
function prettyJSON(text: string) {
  const j = parseJSONMaybe(text);
  return j ? JSON.stringify(j, null, 2) : text;
}
function buildURL(base: string, query: Pair[]) {
  try {
    const u = new URL(base);
    for (const q of filterEnabled(query)) u.searchParams.set(q.key, q.value);
    return u.toString();
  } catch {
    return base;
  }
}
function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
async function copy(text: string, setCopied: (s: string | null) => void, what: string) {
  await navigator.clipboard.writeText(text);
  setCopied(what);
  setTimeout(() => setCopied(null), 1000);
}

// Simple cURL (subset) parser: method, URL, headers, data
function importCurl(curl: string): Partial<Preset> | null {
  // Handles: curl -X POST 'https://x' -H 'k: v' --data '{"a":1}'
  const tokens: string[] = (curl.match(/'[^']*'|"[^"]*"|\S+/g) ?? []) as string[];
  if (tokens.length === 0 || !/curl/i.test(tokens[0] ?? "")) return null;

  let method: Method | undefined;
  let url = "";
  const headers: Pair[] = [];
  let data = "";
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i]!;
    const clean = t.replace(/^['"]|['"]$/g, "");
    if (t === "-X" || t === "--request") {
      const m = tokens[++i]?.replace(/^['"]|['"]$/g, "");
      if (m && METHODS.includes(m as Method)) method = m as Method;
    } else if (t === "-H" || t === "--header") {
      const h = tokens[++i]?.replace(/^['"]|['"]$/g, "");
      const [k, ...rest] = (h ?? "").split(":");
      headers.push({
        id: uid(),
        key: (k ?? "").trim(),
        value: rest.join(":").trim(),
        enabled: true,
      });
    } else if (t === "--data" || t === "--data-raw" || t === "--data-binary" || t === "-d") {
      data = tokens[++i]?.replace(/^['"]|['"]$/g, "") ?? "";
    } else if (/^https?:\/\//.test(clean)) {
      url = clean;
    }
  }
  return {
    method: method ?? "GET",
    url,
    headers,
    bodyMode: data ? "json" : "none",
    bodyText: data || "",
  };
}

function toCurl(p: Preset) {
  const h = filterEnabled(p.headers)
    .map((x) => `-H ${JSON.stringify(`${x.key}: ${x.value}`)}`)
    .join(" ");
  const qUrl = buildURL(p.url, p.query);
  let data = "";
  if (p.bodyMode === "json" || p.bodyMode === "text") {
    if (p.bodyText) data = ` --data ${JSON.stringify(p.bodyText)}`;
  } else if (p.bodyMode === "form") {
    const params = new URLSearchParams();
    for (const f of filterEnabled(p.form)) params.append(f.key, f.value);
    const s = params.toString();
    if (s) data = ` --data ${JSON.stringify(s)}`;
  }
  // multipart omitted (needs files)
  return `curl -X ${p.method} ${JSON.stringify(qUrl)} ${h}${data}`.trim();
}

// ---------- Page ----------
export default function ApiTesterPage() {
  // Request state
  const [method, setMethod] = React.useState<Method>("GET");
  const [url, setUrl] = React.useState("");
  const [query, setQuery] = React.useState<Pair[]>([
    { id: uid(), key: "", value: "", enabled: true },
  ]);
  const [headers, setHeaders] = React.useState<Pair[]>([
    { id: uid(), key: "", value: "", enabled: true },
  ]);

  const [authType, setAuthType] = React.useState<"none" | "bearer" | "basic">("none");
  const [bearer, setBearer] = React.useState("");
  const [basicUser, setBasicUser] = React.useState("");
  const [basicPass, setBasicPass] = React.useState("");

  const [bodyMode, setBodyMode] = React.useState<BodyMode>("none");
  const [bodyText, setBodyText] = React.useState<string>('{\n  "hello": "world"\n}');
  const [form, setForm] = React.useState<Pair[]>([
    { id: uid(), key: "", value: "", enabled: true },
  ]);
  const [multipart, setMultipart] = React.useState<Pair[]>([
    { id: uid(), key: "", value: "", enabled: true },
  ]); // text parts only

  const [timeoutMs, setTimeoutMs] = React.useState<number>(30000);
  const [followRedirects, setFollowRedirects] = React.useState<boolean>(true);

  // Response state
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<number | undefined>(undefined);
  const [statusText, setStatusText] = React.useState<string>("");
  const [timeMs, setTimeMs] = React.useState<number | null>(null);
  const [sizeBytes, setSizeBytes] = React.useState<number | null>(null);
  const [respHeaders, setRespHeaders] = React.useState<[string, string][]>([]);
  const [respBody, setRespBody] = React.useState<string>("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const [viewRaw, setViewRaw] = React.useState(false);

  const [controller, setController] = React.useState<AbortController | null>(null);

  // Presets & History
  const [presets, setPresets] = React.useState<Preset[]>([]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Share URL (basic fields)
  React.useEffect(() => {
    const ww = w();
    if (!ww) return;
    const sp = new URLSearchParams();
    sp.set("m", method);
    if (url) sp.set("u", url);
    const qs = filterEnabled(query)
      .map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`)
      .join("&");
    if (qs) sp.set("q", qs);
    if (authType === "bearer" && bearer) sp.set("b", bearer);
    if (authType === "basic" && basicUser) sp.set("bu", basicUser);
    if (authType === "basic" && basicPass) sp.set("bp", basicPass);
    const next = `${ww.location.pathname}?${sp.toString()}`;
    ww.history.replaceState({}, "", next);
  }, [method, url, query, authType, bearer, basicUser, basicPass]);

  // Load share on mount + presets/history
  React.useEffect(() => {
    const ww = w();
    const store = ls();
    if (!ww) return;

    try {
      const sp = new URLSearchParams(ww.location.search);
      const m = (sp.get("m") as Method) || "GET";
      const u = sp.get("u") || "";
      const q = sp.get("q");
      const b = sp.get("b");
      const bu = sp.get("bu");
      const bp = sp.get("bp");

      setMethod(METHODS.includes(m as Method) ? (m as Method) : "GET");
      if (u) setUrl(u);
      if (q) {
        const pairs: Pair[] = q.split("&").map((pair) => {
          const [k, v] = pair.split("=").map((s) => decodeURIComponent(s ?? ""));
          return { id: uid(), key: k, value: v, enabled: true };
        });
        setQuery(pairs.length ? pairs : [{ id: uid(), key: "", value: "", enabled: true }]);
      }
      if (b) {
        setAuthType("bearer");
        setBearer(b);
      }
      if (bu || bp) {
        setAuthType("basic");
        setBasicUser(bu ?? "");
        setBasicPass(bp ?? "");
      }
    } catch {}

    try {
      const rawPresets = store?.getItem("api-tester-presets");
      if (rawPresets) setPresets(JSON.parse(rawPresets));
      const rawHist = store?.getItem("api-tester-history");
      if (rawHist) setHistory(JSON.parse(rawHist));
    } catch {}
  }, []);

  function persistPresets(next: Preset[]) {
    setPresets(next);
    ls()?.setItem("api-tester-presets", JSON.stringify(next));
  }
  function persistHistory(next: HistoryItem[]) {
    // cap to 100
    const trimmed = next.slice(-100);
    setHistory(trimmed);
    ls()?.setItem("api-tester-history", JSON.stringify(trimmed));
  }

  function addRow(setter: React.Dispatch<React.SetStateAction<Pair[]>>) {
    setter((rows) => [...rows, { id: uid(), key: "", value: "", enabled: true }]);
  }
  function setRow(
    setter: React.Dispatch<React.SetStateAction<Pair[]>>,
    id: string,
    patch: Partial<Pair>,
  ) {
    setter((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeRow(setter: React.Dispatch<React.SetStateAction<Pair[]>>, id: string) {
    setter((rows) => rows.filter((r) => r.id !== id));
  }

  function resetAll() {
    setMethod("GET");
    setUrl("");
    setQuery([{ id: uid(), key: "", value: "", enabled: true }]);
    setHeaders([{ id: uid(), key: "", value: "", enabled: true }]);
    setAuthType("none");
    setBearer("");
    setBasicUser("");
    setBasicPass("");
    setBodyMode("none");
    setBodyText('{\n  "hello": "world"\n}');
    setForm([{ id: uid(), key: "", value: "", enabled: true }]);
    setMultipart([{ id: uid(), key: "", value: "", enabled: true }]);
    setTimeoutMs(30000);
    setFollowRedirects(true);
    setStatus(undefined);
    setStatusText("");
    setTimeMs(null);
    setSizeBytes(null);
    setRespHeaders([]);
    setRespBody("");
    setCopied(null);
    setViewRaw(false);
  }

  async function send() {
    if (loading) return;
    setLoading(true);
    setStatus(undefined);
    setStatusText("");
    setTimeMs(null);
    setSizeBytes(null);
    setRespHeaders([]);
    setRespBody("");

    const ac = new AbortController();
    setController(ac);
    const timer = setTimeout(() => ac.abort("timeout"), Math.max(1, timeoutMs));

    const reqHeaders: Record<string, string> = kvToObject(headers);
    // add auth
    if (authType === "bearer" && bearer) reqHeaders["Authorization"] = `Bearer ${bearer}`;
    if (authType === "basic") {
      const b64 = typeof btoa !== "undefined" ? btoa(`${basicUser}:${basicPass}`) : "";
      reqHeaders["Authorization"] = `Basic ${b64}`;
    }

    let body: BodyInit | undefined;
    const ct = reqHeaders["Content-Type"] || reqHeaders["content-type"];

    try {
      if (method !== "GET" && method !== "HEAD") {
        if (bodyMode === "json") {
          body = bodyText || "";
          if (!ct) reqHeaders["Content-Type"] = "application/json;charset=utf-8";
        } else if (bodyMode === "text") {
          body = bodyText || "";
          if (!ct) reqHeaders["Content-Type"] = "text/plain;charset=utf-8";
        } else if (bodyMode === "form") {
          const params = new URLSearchParams();
          for (const f of filterEnabled(form)) params.append(f.key, f.value);
          body = params.toString();
          reqHeaders["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
        } else if (bodyMode === "multipart") {
          const fd = new FormData();
          for (const m of filterEnabled(multipart)) fd.append(m.key, m.value);
          body = fd;
          // Let browser set boundary; delete any manual content-type
          delete reqHeaders["Content-Type"];
        }
      }

      const builtUrl = buildURL(url, query);
      const init: RequestInit = {
        method,
        headers: reqHeaders,
        body,
        signal: ac.signal,
        redirect: followRedirects ? "follow" : "manual",
      };

      const t0 = performance.now();
      const res = await fetch(builtUrl, init);
      const t1 = performance.now();

      setStatus(res.status);
      setStatusText(res.statusText);
      setTimeMs(t1 - t0);

      const hdrs: [string, string][] = [];
      res.headers.forEach((v, k) => hdrs.push([k, v]));
      setRespHeaders(hdrs);

      // try to read as text always (covers json too)
      const buf = await res.arrayBuffer();
      setSizeBytes(buf.byteLength);
      let text = "";
      try {
        text = new TextDecoder().decode(buf);
      } catch {
        text = "";
      }
      setRespBody(text);

      // history entry
      const hist: HistoryItem = {
        id: uid(),
        when: new Date().toISOString(),
        method,
        url,
        query,
        headers,
        auth: { type: authType, bearer, basicUser, basicPass },
        bodyMode,
        bodyText,
        form,
        multipart,
        status: res.status,
        ms: t1 - t0,
      };
      persistHistory([...history, hist]);
    } catch (e: any) {
      setStatus(undefined);
      setStatusText(String(e?.message || e || "Request failed"));
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setController(null);
    }
  }

  function stop() {
    controller?.abort("user");
  }

  function savePreset() {
    const title = prompt("Preset title?") || `${method} ${url}`.slice(0, 60);
    const preset: Preset = {
      id: uid(),
      title,
      method,
      url,
      query,
      headers,
      auth: { type: authType, bearer, basicUser, basicPass },
      bodyMode,
      bodyText,
      form,
      multipart,
    };
    const next = [...presets, preset];
    persistPresets(next);
  }

  function applyPreset(p: Preset) {
    setMethod(p.method);
    setUrl(p.url);
    setQuery(p.query.length ? p.query : [{ id: uid(), key: "", value: "", enabled: true }]);
    setHeaders(p.headers.length ? p.headers : [{ id: uid(), key: "", value: "", enabled: true }]);
    setAuthType(p.auth.type);
    setBearer(p.auth.bearer ?? "");
    setBasicUser(p.auth.basicUser ?? "");
    setBasicPass(p.auth.basicPass ?? "");
    setBodyMode(p.bodyMode);
    setBodyText(p.bodyText);
    setForm(p.form.length ? p.form : [{ id: uid(), key: "", value: "", enabled: true }]);
    setMultipart(
      p.multipart.length ? p.multipart : [{ id: uid(), key: "", value: "", enabled: true }],
    );
  }

  function removePreset(id: string) {
    const next = presets.filter((p) => p.id !== id);
    persistPresets(next);
  }

  function importFromCurl() {
    const curl = prompt("Paste cURL command:");
    if (!curl) return;
    const patch = importCurl(curl);
    if (!patch) return alert("Could not parse this cURL.");
    if (patch.method) setMethod(patch.method);
    if (patch.url) setUrl(patch.url);
    if (patch.headers) setHeaders(patch.headers);
    if (patch.bodyText !== undefined) setBodyText(prettyJSON(patch.bodyText));
    if (patch.bodyMode) setBodyMode(patch.bodyMode);
  }

  function exportResponse() {
    const blob = new Blob([respBody], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "response.txt");
  }

  // ---------- UI ----------
  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Network className="h-6 w-6" /> API Tester
          </h1>
          <p className="text-sm text-muted-foreground">
            Build requests, send, inspect responses — all in your browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={savePreset} className="gap-2">
            <Save className="h-4 w-4" /> Save Preset
          </Button>
          <Button variant="outline" onClick={importFromCurl} className="gap-2">
            <Upload className="h-4 w-4" /> Import cURL
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              copy(
                toCurl({
                  id: "tmp",
                  title: "",
                  method,
                  url,
                  query,
                  headers,
                  auth: { type: authType, bearer, basicUser, basicPass },
                  bodyMode,
                  bodyText,
                  form,
                  multipart,
                }),
                setCopied,
                "curl",
              )
            }
            className="gap-2"
          >
            <Link2 className="h-4 w-4" /> Copy cURL{" "}
            {copied === "curl" ? <Check className="h-4 w-4" /> : null}
          </Button>
        </div>
      </GlassCard>

      {/* Request Builder */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Request</CardTitle>
          <CardDescription>
            Configure method, URL, query params, headers, auth, and body.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method + URL (dropdown) */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Method</Label>
              <select
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="https://api.example.com/v1/users"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Query params */}
          <div className="space-y-2">
            <Label>Query Params</Label>
            <div className="grid gap-2">
              {query.map((row) => (
                <div key={row.id} className="grid grid-cols-[20px_1fr_1fr_36px] gap-2">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => setRow(setQuery, row.id, { enabled: e.target.checked })}
                    aria-label="enable"
                  />
                  <Input
                    placeholder="key"
                    value={row.key}
                    onChange={(e) => setRow(setQuery, row.id, { key: e.target.value })}
                  />
                  <Input
                    placeholder="value"
                    value={row.value}
                    onChange={(e) => setRow(setQuery, row.id, { value: e.target.value })}
                  />
                  <Button variant="outline" size="icon" onClick={() => removeRow(setQuery, row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addRow(setQuery)}
                className="w-fit gap-2"
              >
                <Plus className="h-4 w-4" /> Add param
              </Button>
            </div>
          </div>

          <Separator />

          {/* Headers */}
          <div className="space-y-2">
            <Label>Headers</Label>
            <div className="grid gap-2">
              {headers.map((row) => (
                <div key={row.id} className="grid grid-cols-[20px_1fr_1fr_36px] gap-2">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => setRow(setHeaders, row.id, { enabled: e.target.checked })}
                    aria-label="enable"
                  />
                  <Input
                    placeholder="Header-Name"
                    value={row.key}
                    onChange={(e) => setRow(setHeaders, row.id, { key: e.target.value })}
                  />
                  <Input
                    placeholder="header value"
                    value={row.value}
                    onChange={(e) => setRow(setHeaders, row.id, { value: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeRow(setHeaders, row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addRow(setHeaders)}
                className="w-fit gap-2"
              >
                <Plus className="h-4 w-4" /> Add header
              </Button>
            </div>
          </div>

          {/* Auth */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Auth</Label>
              <div className="flex flex-wrap gap-2">
                {(["none", "bearer", "basic"] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={authType === t ? "default" : "outline"}
                    onClick={() => setAuthType(t)}
                  >
                    {t.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            {authType === "bearer" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Bearer Token</Label>
                <Input
                  placeholder="eyJhbGciOi..."
                  value={bearer}
                  onChange={(e) => setBearer(e.target.value)}
                />
              </div>
            )}
            {authType === "basic" && (
              <>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={basicUser} onChange={(e) => setBasicUser(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={basicPass}
                    onChange={(e) => setBasicPass(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Body */}
          <div className="space-y-2">
            <Label>Body</Label>
            <div className="flex flex-wrap gap-2">
              {(["none", "json", "text", "form", "multipart"] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={bodyMode === m ? "default" : "outline"}
                  onClick={() => setBodyMode(m)}
                >
                  {m.toUpperCase()}
                </Button>
              ))}
            </div>

            {bodyMode === "json" || bodyMode === "text" ? (
              <Textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="min-h-[160px] font-mono"
                placeholder={bodyMode === "json" ? '{ "name": "Alice" }' : "Plain text body"}
              />
            ) : null}

            {bodyMode === "form" && (
              <div className="grid gap-2">
                {form.map((row) => (
                  <div key={row.id} className="grid grid-cols-[20px_1fr_1fr_36px] gap-2">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => setRow(setForm, row.id, { enabled: e.target.checked })}
                    />
                    <Input
                      placeholder="key"
                      value={row.key}
                      onChange={(e) => setRow(setForm, row.id, { key: e.target.value })}
                    />
                    <Input
                      placeholder="value"
                      value={row.value}
                      onChange={(e) => setRow(setForm, row.id, { value: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeRow(setForm, row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRow(setForm)}
                  className="w-fit gap-2"
                >
                  <Plus className="h-4 w-4" /> Add field
                </Button>
              </div>
            )}

            {bodyMode === "multipart" && (
              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground">
                  For simplicity, multipart here only sends text fields (no files).
                </p>
                {multipart.map((row) => (
                  <div key={row.id} className="grid grid-cols-[20px_1fr_1fr_36px] gap-2">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => setRow(setMultipart, row.id, { enabled: e.target.checked })}
                    />
                    <Input
                      placeholder="field name"
                      value={row.key}
                      onChange={(e) => setRow(setMultipart, row.id, { key: e.target.value })}
                    />
                    <Input
                      placeholder="value"
                      value={row.value}
                      onChange={(e) => setRow(setMultipart, row.id, { value: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeRow(setMultipart, row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRow(setMultipart)}
                  className="w-fit gap-2"
                >
                  <Plus className="h-4 w-4" /> Add field
                </Button>
              </div>
            )}
          </div>

          {/* Options (sticky send row feel) */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                min={1}
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div className="space-y-1 flex items-end gap-2">
              <Switch checked={followRedirects} onCheckedChange={setFollowRedirects} />
              <span className="text-sm text-muted-foreground">Follow redirects</span>
            </div>
            <div className="space-y-1 flex items-end gap-2">
              <Button onClick={send} disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ActivitySquare className="h-4 w-4" />
                )}{" "}
                Send
              </Button>
              {loading && (
                <Button variant="outline" onClick={stop} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Abort
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-6" />

      {/* Response */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Response</CardTitle>
          <CardDescription>Status, time, size, headers and body preview.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={
                status ? (status >= 200 && status < 300 ? "secondary" : "outline") : "outline"
              }
            >
              {status ? `HTTP ${status} ${statusText}` : "—"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock4 className="h-3.5 w-3.5" /> {timeMs != null ? `${timeMs.toFixed(2)}ms` : "—"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Wand2 className="h-3.5 w-3.5" /> {sizeBytes != null ? `${sizeBytes} bytes` : "—"}
            </Badge>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>View</span>
                <select
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                  value={viewRaw ? "raw" : "pretty"}
                  onChange={(e) => setViewRaw(e.target.value === "raw")}
                >
                  <option value="pretty">Pretty</option>
                  <option value="raw">Raw</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(respBody, setCopied, "resp")}
                className="gap-2"
                disabled={!respBody}
              >
                <Copy className="h-4 w-4" /> Copy body{" "}
                {copied === "resp" ? <Check className="h-4 w-4" /> : null}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportResponse}
                className="gap-2"
                disabled={!respBody}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>

          {/* Headers */}
          <div className="rounded-md border">
            <div className="px-3 py-2 text-xs text-muted-foreground">Headers</div>
            <div className="divide-y">
              {respHeaders.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">—</div>
              ) : (
                respHeaders.map(([k, v], i) => (
                  <div
                    key={`${k}-${i}`}
                    className="grid grid-cols-3 gap-2 p-2 text-sm sm:grid-cols-6"
                  >
                    <div className="col-span-2 font-medium">{k}</div>
                    <div className="col-span-4 break-words">{v}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              readOnly
              className="min-h-[220px] font-mono"
              value={viewRaw ? respBody : prettyJSON(respBody)}
              placeholder="—"
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-6" />

      {/* Presets */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Presets</CardTitle>
          <CardDescription>Save and reuse frequent requests.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {presets.length === 0 ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              No presets yet. Click <em>Save Preset</em> to store the current request.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {presets.map((p) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-medium">{p.title}</div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => applyPreset(p)}
                        title="Apply"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removePreset(p.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground break-words">
                    {p.method} {p.url}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </GlassCard>

      <Separator className="my-6" />

      {/* History */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Recent requests (stored locally).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {history.length === 0 ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              No history yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <div key={h.id} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="font-medium">{h.method}</span>{" "}
                          <span className="text-muted-foreground">{h.url}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{h.status ?? "—"}</Badge>
                        <Badge variant="outline">
                          {h.ms != null ? `${(h.ms as number).toFixed?.(2) ?? h.ms}ms` : "—"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          applyPreset({
                            id: "from-hist",
                            title: "",
                            method: h.method,
                            url: h.url,
                            query: h.query,
                            headers: h.headers,
                            auth: h.auth,
                            bodyMode: h.bodyMode,
                            bodyText: h.bodyText,
                            form: h.form,
                            multipart: h.multipart,
                          })
                        }
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const next = history.filter((x) => x.id !== h.id);
                          persistHistory(next);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
