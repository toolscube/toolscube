"use client";

import {
  ActivitySquare,
  Clock4,
  Edit3,
  Eye,
  History,
  Loader2,
  type LucideIcon,
  Network,
  Plus,
  Save,
  ScanLine,
  Send,
  Settings2,
  Trash,
  Trash2,
  Upload,
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
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type BodyMode = "none" | "json" | "text" | "form" | "multipart";
type AuthType = "none" | "bearer" | "basic";
type Pair = { id: string; key: string; value: string; enabled: boolean };

type Option = {
  value: Method;
  label: string;
  icon?: LucideIcon;
};

type Preset = {
  id: string;
  title: string;
  method: Method;
  url: string;
  query: Pair[];
  headers: Pair[];
  auth: {
    type: AuthType;
    bearer?: string;
    basicUser?: string;
    basicPass?: string;
  };
  bodyMode: BodyMode;
  bodyText: string;
  form: Pair[];
  multipart: Pair[];
};

type HistoryItem = Omit<Preset, "title"> & {
  when: string;
  status?: number;
  ms?: number;
};

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const STORAGE_PRESETS = "api-tester-presets";
const STORAGE_HISTORY = "api-tester-history";

const uid = () => Math.random().toString(36).slice(2, 9);

const isBrowser = typeof window !== "undefined";
const getLS = () => (isBrowser ? window.localStorage : undefined);

function pairsEnabled(pairs: Pair[]): Pair[] {
  return pairs.filter((p) => p.enabled && p.key.trim() !== "");
}
function pairsToObject(pairs: Pair[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of pairsEnabled(pairs)) out[p.key] = p.value;
  return out;
}
function safeParseJSON(s: string): unknown | undefined {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
function maybePrettyJSON(text: string): string {
  const parsed = safeParseJSON(text);
  return parsed !== undefined ? JSON.stringify(parsed, null, 2) : text;
}
function buildURL(base: string, query: Pair[]): string {
  try {
    const u = new URL(base);
    for (const q of pairsEnabled(query)) u.searchParams.set(q.key, q.value);
    return u.toString();
  } catch {
    return base;
  }
}

/** super small cURL importer (subset) */
function importCurl(curl: string): Partial<Preset> | null {
  const tokens = (curl.match(/'[^']*'|"[^"]*"|\S+/g) ?? []) as string[];
  if (tokens.length === 0 || !/curl/i.test(tokens[0] ?? "")) return null;

  let method: Method | undefined;
  let url = "";
  const headers: Pair[] = [];
  let data = "";

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
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
  const h = pairsEnabled(p.headers)
    .map((x) => `-H ${JSON.stringify(`${x.key}: ${x.value}`)}`)
    .join(" ");
  const qUrl = buildURL(p.url, p.query);
  let data = "";
  if (p.bodyMode === "json" || p.bodyMode === "text") {
    if (p.bodyText) data = ` --data ${JSON.stringify(p.bodyText)}`;
  } else if (p.bodyMode === "form") {
    const params = new URLSearchParams();
    for (const f of pairsEnabled(p.form)) params.append(f.key, f.value);
    const s = params.toString();
    if (s) data = ` --data ${JSON.stringify(s)}`;
  }
  // multipart omitted (needs files)
  return `curl -X ${p.method} ${JSON.stringify(qUrl)} ${h}${data}`.trim();
}

// KV
function KVRow({
  row,
  onChange,
  onRemove,
  checkboxAriaLabel = "enable",
  keyPlaceholder = "key",
  valPlaceholder = "value",
}: {
  row: Pair;
  onChange: (patch: Partial<Pair>) => void;
  onRemove: () => void;
  checkboxAriaLabel?: string;
  keyPlaceholder?: string;
  valPlaceholder?: string;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr_1fr_36px] gap-2 items-end">
      <InputField
        type="checkbox"
        checked={row.enabled}
        aria-label={checkboxAriaLabel}
        onChange={(e) => onChange({ enabled: e.target.checked })}
      />
      <InputField
        placeholder={keyPlaceholder}
        value={row.key}
        onChange={(e) => onChange({ key: e.target.value })}
      />
      <InputField
        placeholder={valPlaceholder}
        value={row.value}
        onChange={(e) => onChange({ value: e.target.value })}
      />
      <ActionButton size="icon" icon={Trash2} onClick={onRemove} />
    </div>
  );
}

function KVSection({
  label,
  rows,
  setRows,
  keyPlaceholder,
  valPlaceholder,
  addLabel,
}: {
  label: string;
  rows: Pair[];
  setRows: React.Dispatch<React.SetStateAction<Pair[]>>;
  keyPlaceholder: string;
  valPlaceholder: string;
  addLabel: string;
}) {
  const onAdd = React.useCallback(
    () => setRows((prev) => [...prev, { id: uid(), key: "", value: "", enabled: true }]),
    [setRows],
  );

  const onChangeRow = React.useCallback(
    (id: string, patch: Partial<Pair>) =>
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
    [setRows],
  );

  const onRemoveRow = React.useCallback(
    (id: string) => setRows((prev) => prev.filter((r) => r.id !== id)),
    [setRows],
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2">
        {rows.map((row) => (
          <KVRow
            key={row.id}
            row={row}
            onChange={(patch) => onChangeRow(row.id, patch)}
            onRemove={() => onRemoveRow(row.id)}
            keyPlaceholder={keyPlaceholder}
            valPlaceholder={valPlaceholder}
          />
        ))}
        <ActionButton size="sm" onClick={onAdd} className="w-fit" label={addLabel} icon={Plus} />
      </div>
    </div>
  );
}

export default function ApiTesterClient() {
  // Request state
  const [method, setMethod] = React.useState<Method>("GET");
  const [url, setUrl] = React.useState("");
  const [query, setQuery] = React.useState<Pair[]>([
    { id: uid(), key: "", value: "", enabled: true },
  ]);
  const [headers, setHeaders] = React.useState<Pair[]>([
    { id: uid(), key: "", value: "", enabled: true },
  ]);

  const [authType, setAuthType] = React.useState<AuthType>("none");
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
  ]);

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
  const [viewRaw, setViewRaw] = React.useState(false);

  const [controller, setController] = React.useState<AbortController | null>(null);

  // Presets & History
  const [presets, setPresets] = React.useState<Preset[]>([]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Share URL (basic fields)
  React.useEffect(() => {
    if (!isBrowser) return;
    const sp = new URLSearchParams();
    sp.set("m", method);
    if (url) sp.set("u", url);
    const qs = pairsEnabled(query)
      .map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`)
      .join("&");
    if (qs) sp.set("q", qs);
    if (authType === "bearer" && bearer) sp.set("b", bearer);
    if (authType === "basic" && basicUser) sp.set("bu", basicUser);
    if (authType === "basic" && basicPass) sp.set("bp", basicPass);
    const next = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState({}, "", next);
  }, [authType, basicPass, basicUser, bearer, method, query, url]);

  // Load from URL + presets/history
  React.useEffect(() => {
    if (!isBrowser) return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const m = (sp.get("m") as Method) || "GET";
      const u = sp.get("u") || "";
      const q = sp.get("q");
      const b = sp.get("b");
      const bu = sp.get("bu");
      const bp = sp.get("bp");

      setMethod(METHODS.includes(m) ? m : "GET");
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
    } catch {
      // ignore
    }

    try {
      const store = getLS();
      const rawPresets = store?.getItem(STORAGE_PRESETS);
      if (rawPresets) setPresets(JSON.parse(rawPresets) as Preset[]);
      const rawHist = store?.getItem(STORAGE_HISTORY);
      if (rawHist) setHistory(JSON.parse(rawHist) as HistoryItem[]);
    } catch {
      // ignore
    }
  }, []);

  const persistPresets = React.useCallback((next: Preset[]) => {
    setPresets(next);
    getLS()?.setItem(STORAGE_PRESETS, JSON.stringify(next));
  }, []);
  const persistHistory = React.useCallback((next: HistoryItem[]) => {
    const trimmed = next.slice(-100);
    setHistory(trimmed);
    getLS()?.setItem(STORAGE_HISTORY, JSON.stringify(trimmed));
  }, []);

  const resetAll = React.useCallback(() => {
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
    setViewRaw(false);
  }, []);

  const savePreset = React.useCallback(() => {
    const title =
      (isBrowser ? window.prompt("Preset title?") : null) || `${method} ${url}`.slice(0, 60);
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
    persistPresets([...presets, preset]);
  }, [
    authType,
    basicPass,
    basicUser,
    bearer,
    bodyMode,
    bodyText,
    form,
    headers,
    method,
    multipart,
    persistPresets,
    presets,
    query,
    url,
  ]);

  const applyPreset = React.useCallback((p: Preset) => {
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
  }, []);

  const removePreset = React.useCallback(
    (id: string) => persistPresets(presets.filter((p) => p.id !== id)),
    [persistPresets, presets],
  );

  const importFromCurl = React.useCallback(() => {
    const curl = isBrowser ? window.prompt("Paste cURL command:") : null;
    if (!curl) return;
    const patch = importCurl(curl);
    if (!patch) {
      if (isBrowser) window.alert("Could not parse this cURL.");
      return;
    }
    if (patch.method) setMethod(patch.method);
    if (patch.url) setUrl(patch.url);
    if (patch.headers) setHeaders(patch.headers);
    if (patch.bodyText !== undefined) setBodyText(maybePrettyJSON(patch.bodyText));
    if (patch.bodyMode) setBodyMode(patch.bodyMode);
  }, []);

  const stop = React.useCallback(() => controller?.abort("user"), [controller]);

  const send = React.useCallback(async () => {
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
    const guard = setTimeout(() => ac.abort("timeout"), Math.max(1, timeoutMs));

    const reqHeaders = { ...pairsToObject(headers) };

    if (authType === "bearer" && bearer)
      // auth
      reqHeaders.Authorization = `Bearer ${bearer}`;
    if (authType === "basic") {
      const basic = `${basicUser}:${basicPass}`;
      const b64 = typeof btoa !== "undefined" ? btoa(basic) : "";
      reqHeaders.Authorization = `Basic ${b64}`;
    }

    let body: BodyInit | undefined;
    const providedCT = reqHeaders["Content-Type"] ?? reqHeaders["content-type"];

    try {
      if (method !== "GET" && method !== "HEAD") {
        if (bodyMode === "json") {
          body = bodyText || "";
          if (!providedCT) reqHeaders["Content-Type"] = "application/json;charset=utf-8";
        } else if (bodyMode === "text") {
          body = bodyText || "";
          if (!providedCT) reqHeaders["Content-Type"] = "text/plain;charset=utf-8";
        } else if (bodyMode === "form") {
          const params = new URLSearchParams();
          for (const f of pairsEnabled(form)) params.append(f.key, f.value);
          body = params.toString();
          reqHeaders["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
        } else if (bodyMode === "multipart") {
          const fd = new FormData();
          for (const m of pairsEnabled(multipart)) fd.append(m.key, m.value);
          body = fd;
          // Let the browser set boundary for multipart
          delete (reqHeaders as Record<string, string>)["Content-Type"];
          delete (reqHeaders as Record<string, string>)["content-type"];
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
      res.headers.forEach((v, k) => {
        hdrs.push([k, v]);
      });
      setRespHeaders(hdrs);

      const buf = await res.arrayBuffer();
      setSizeBytes(buf.byteLength);
      let text = "";
      try {
        text = new TextDecoder().decode(buf);
      } catch {
        text = "";
      }
      setRespBody(text);

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(undefined);
      setStatusText(msg);
    } finally {
      clearTimeout(guard);
      setLoading(false);
      setController(null);
    }
  }, [
    authType,
    basicPass,
    basicUser,
    bearer,
    bodyMode,
    bodyText,
    followRedirects,
    form,
    headers,
    history,
    loading,
    method,
    multipart,
    persistHistory,
    query,
    timeoutMs,
    url,
  ]);

  const curlString = React.useMemo(
    () =>
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
    [
      authType,
      basicPass,
      basicUser,
      bearer,
      bodyMode,
      bodyText,
      form,
      headers,
      method,
      multipart,
      query,
      url,
    ],
  );

  const responseLooksJSON = React.useMemo(() => {
    const ct = respHeaders.find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "";
    return /\bapplication\/(json|.+\+json)\b/i.test(ct);
  }, [respHeaders]);

  const methodOptions: Option[] = [
    { value: "GET", label: "GET", icon: Eye },
    { value: "POST", label: "POST", icon: Send },
    { value: "PUT", label: "PUT", icon: Upload },
    { value: "PATCH", label: "PATCH", icon: Edit3 },
    { value: "DELETE", label: "DELETE", icon: Trash },
    { value: "HEAD", label: "HEAD", icon: ScanLine },
    { value: "OPTIONS", label: "OPTIONS", icon: Settings2 },
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Network}
        title="API Tester"
        description="Build requests, send, inspect responses — all in your browser."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton icon={Save} label="Save Preset" onClick={savePreset} />
            <ActionButton icon={Upload} label="Import cURL" onClick={importFromCurl} />
            <CopyButton
              variant="default"
              disabled={!curlString}
              label="Copy cURL"
              getText={curlString}
            />
          </>
        }
      />
      {/* Request Builder */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Request</CardTitle>
          <CardDescription>Configure method, URL, params, headers, auth, and body.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method + URL */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] items-end">
            <SelectField
              label="Method"
              value={method}
              onValueChange={(value) => setMethod(value as Method)}
              options={methodOptions}
            />

            <InputField
              placeholder="https://api.example.com/v1/users"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Query */}
          <KVSection
            label="Query Params"
            rows={query}
            setRows={setQuery}
            keyPlaceholder="key"
            valPlaceholder="value"
            addLabel="Add param"
          />

          <Separator />

          {/* Headers */}
          <KVSection
            label="Headers"
            rows={headers}
            setRows={setHeaders}
            keyPlaceholder="Header-Name"
            valPlaceholder="header value"
            addLabel="Add header"
          />

          {/* Quick common headers */}
          <div className="flex flex-wrap gap-2">
            <ActionButton
              label="Accept: application/json"
              size="sm"
              onClick={() =>
                setHeaders((r) => [
                  ...r,
                  { id: uid(), key: "Accept", value: "application/json", enabled: true },
                ])
              }
            />
            <ActionButton
              label="Content-Type: application/json"
              size="sm"
              onClick={() =>
                setHeaders((r) => [
                  ...r,
                  { id: uid(), key: "Content-Type", value: "application/json", enabled: true },
                ])
              }
            />
          </div>

          {/* Auth */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Auth</Label>
              <div className="flex flex-wrap gap-2">
                {(["none", "bearer", "basic"] as const).map((t) => (
                  <ActionButton
                    key={t}
                    size="sm"
                    label={t.toUpperCase()}
                    variant={authType === t ? "default" : "outline"}
                    onClick={() => setAuthType(t)}
                  />
                ))}
              </div>
            </div>
            {authType === "bearer" && (
              <div className="md:col-span-2">
                <InputField
                  label="Bearer Token"
                  placeholder="eyJhbGciOi..."
                  value={bearer}
                  onChange={(e) => setBearer(e.target.value)}
                />
              </div>
            )}
            {authType === "basic" && (
              <>
                <InputField
                  label="Username"
                  value={basicUser}
                  onChange={(e) => setBasicUser(e.target.value)}
                />
                <InputField
                  label="Password"
                  type="password"
                  value={basicPass}
                  onChange={(e) => setBasicPass(e.target.value)}
                />
              </>
            )}
          </div>

          <Separator />

          {/* Body */}
          <div className="space-y-2">
            <Label>Body</Label>
            <div className="flex flex-wrap gap-2">
              {(["none", "json", "text", "form", "multipart"] as const).map((m) => (
                <ActionButton
                  key={m}
                  label={m.toUpperCase()}
                  size="sm"
                  variant={bodyMode === m ? "default" : "outline"}
                  onClick={() => setBodyMode(m)}
                />
              ))}
            </div>

            {(bodyMode === "json" || bodyMode === "text") && (
              <>
                <TextareaField
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  textareaClassName="min-h-[160px] font-mono"
                  placeholder={bodyMode === "json" ? '{ "name": "Alice" }' : "Plain text body"}
                />
                {bodyMode === "json" && (
                  <div className="flex gap-2">
                    <ActionButton
                      label="Prettify JSON"
                      size="sm"
                      icon={Wand2}
                      onClick={() => setBodyText(maybePrettyJSON(bodyText))}
                    />
                  </div>
                )}
              </>
            )}

            {bodyMode === "form" && (
              <KVSection
                label="Form Fields"
                rows={form}
                setRows={setForm}
                keyPlaceholder="key"
                valPlaceholder="value"
                addLabel="Add field"
              />
            )}

            {bodyMode === "multipart" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  For simplicity, multipart here only sends text fields (no files).
                </p>
                <KVSection
                  label="Multipart Fields"
                  rows={multipart}
                  setRows={setMultipart}
                  keyPlaceholder="field name"
                  valPlaceholder="value"
                  addLabel="Add field"
                />
              </div>
            )}
          </div>

          {/* Options + Send */}
          <div className="grid gap-3 md:grid-cols-3 items-end">
            <InputField
              label="Timeout (ms)"
              type="number"
              min={1}
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Math.max(1, Number(e.target.value) || 1))}
            />

            <SwitchRow
              className="h-fit"
              checked={followRedirects}
              onCheckedChange={setFollowRedirects}
              label="Follow redirects"
            />
            <div className="space-y-1 flex items-end gap-2">
              <Button onClick={send} disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ActivitySquare className="h-4 w-4" />
                )}{" "}
                Send
              </Button>
              {loading && <ActionButton icon={Trash2} label="Stop" onClick={stop} />}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Response */}
      <GlassCard>
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
              <SelectField
                value={viewRaw ? "raw" : "pretty"}
                onValueChange={(v) => setViewRaw(v === "raw")}
                options={[
                  { value: "pretty", label: "Pretty" },
                  { value: "raw", label: "Raw" },
                ]}
              />
              <CopyButton label="Copy body" getText={respBody} />
              <ExportTextButton
                variant="default"
                getText={() => respBody}
                filename="response.txt"
                label="Download"
                disabled={!respBody}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="px-3 py-2 text-xs text-muted-foreground">Headers</div>
            <div className="divide-y">
              {respHeaders.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">—</div>
              ) : (
                respHeaders.map(([k, v], i) => (
                  <div
                    key={`${k}-${i as number}`}
                    className="grid grid-cols-3 gap-2 p-2 text-sm sm:grid-cols-6"
                  >
                    <div className="col-span-2 font-medium">{k}</div>
                    <div className="col-span-4 break-words">{v}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <TextareaField
              readOnly
              textareaClassName="min-h-[220px] font-mono"
              value={viewRaw || !responseLooksJSON ? respBody : maybePrettyJSON(respBody)}
              placeholder="—"
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      <GlassCard>
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
                      <ActionButton icon={Plus} size="icon" onClick={() => applyPreset(p)} />
                      <ActionButton
                        icon={Trash2}
                        size="icon"
                        variant="destructive"
                        onClick={() => removePreset(p.id)}
                      />
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

      <Separator className="my-4" />

      {/* History */}
      <GlassCard>
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
                      <ActionButton
                        label="Apply"
                        size="sm"
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
                      />
                      <ActionButton
                        label="Delete"
                        size="sm"
                        onClick={() => {
                          const next = history.filter((x) => x.id !== h.id);
                          persistHistory(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </>
  );
}
