"use client";

import { Link2, Search, ShieldAlert, Unlink2 } from "lucide-react";
import * as React from "react";
import { useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatUrl, isLikelyShortener } from "@/lib/utils/link-expand";

const DEFAULT_MAX_HOPS = 10;

export default function LinkExpandClient() {
  const [url, setUrl] = useState("");
  const [maxHops, setMaxHops] = useState<number>(DEFAULT_MAX_HOPS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);

  const parsedHost = useMemo(() => {
    try {
      return new URL(formatUrl(url)).host;
    } catch {
      return "";
    }
  }, [url]);

  const risky = useMemo(() => {
    if (!parsedHost) return false;
    return isLikelyShortener(parsedHost.toLowerCase());
  }, [parsedHost]);

  async function expand() {
    const clean = formatUrl(url);
    try {
      new URL(clean);
    } catch {
      setResult({
        ok: false,
        inputUrl: url,
        finalUrl: "",
        totalHops: 0,
        hops: [],
        error: "Invalid URL. Please enter a valid URL (e.g., https://example.com).",
        startedAt: new Date().toISOString(),
        ms: 0,
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const t0 = performance.now();
      const res = await fetch("/api/link-expand", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: clean, maxHops }),
      });
      const data = (await res.json()) as Result;
      const t1 = performance.now();
      const final: Result = { ...data, ms: Math.round(t1 - t0) };
      setResult(final);
      setHistory((h) => [final, ...h].slice(0, 20));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to expand link.";

      setResult({
        ok: false,
        inputUrl: clean,
        finalUrl: "",
        totalHops: 0,
        hops: [],
        error: message,
        startedAt: new Date().toISOString(),
        ms: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setUrl("");
    setMaxHops(DEFAULT_MAX_HOPS);
    setResult(null);
  }

  const meta = result?.meta;

  const getHistoryRows = React.useCallback(() => {
    return [
      ["Time", "Input URL", "Final URL", "OK", "Hops", "Duration(ms)"],
      ...history.map((r) => [
        new Date(r.startedAt).toLocaleString(),
        r.inputUrl,
        r.finalUrl,
        String(r.ok),
        String(r.totalHops),
        String(r.ms),
      ]),
    ] as (string | number)[][];
  }, [history]);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Link2}
        title="Link Expander"
        description="Unshorten links, inspect redirect chain, and preview the final destination safely."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              onClick={expand}
              label={loading ? "Expanding..." : "Expand"}
              icon={loading ? Search : Unlink2}
              variant="default"
              disabled={!url}
            />
          </>
        }
      />

      {/* Input & Options */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
          <CardDescription>Enter a short or tracking link to reveal the final URL.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <InputField
                id="url"
                label="URL"
                placeholder="https://bit.ly/xyz or https://t.co/abc..."
                value={url}
                className="w-full"
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && expand()}
              />
              <CopyButton getText={() => url || ""} />
            </div>

            {!!parsedHost && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant={risky ? "destructive" : "secondary"}>{parsedHost}</Badge>
                {risky && (
                  <span className="inline-flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Known shortener detected
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <InputField
              id="maxHops"
              label="Max Redirect Hops"
              type="number"
              min={1}
              max={30}
              value={maxHops}
              onChange={(e) =>
                setMaxHops(Math.min(30, Math.max(1, Number(e.target.value) || DEFAULT_MAX_HOPS)))
              }
            />
            <p className="text-xs text-muted-foreground">
              Prevents infinite loops. Default {DEFAULT_MAX_HOPS}.
            </p>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Result */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
          <CardDescription>Redirect chain & final destination details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && (
            <p className="text-sm text-muted-foreground">
              No expansion yet. Paste a URL and click Expand.
            </p>
          )}

          {result && (
            <>
              {/* Summary */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Input</div>
                  <div className="mt-1 break-all">{result.inputUrl}</div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Final URL</div>
                    <div className="flex gap-2">
                      <CopyButton getText={result.finalUrl || ""} />
                      <LinkButton href={result.finalUrl} label="Open" />
                    </div>
                  </div>
                  <div className="mt-1 break-all">{result.finalUrl || "—"}</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {result.ok ? (
                  <>
                    Resolved in <strong>{result.ms} ms</strong> with{" "}
                    <strong>{result.totalHops}</strong> hop
                    {result.totalHops === 1 ? "" : "s"}.
                  </>
                ) : (
                  <>
                    <span className="text-red-500">Failed:</span> {result.error || "Unknown error"}.
                  </>
                )}
              </div>

              {/* Hop-by-hop */}
              <div className="rounded-md border">
                <div className="px-3 py-2 border-b text-sm font-medium">Redirect Chain</div>
                <div className="divide-y">
                  {result.hops.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">No redirects.</div>
                  )}
                  {result.hops.map((h) => (
                    <div key={h.index} className="p-3 text-sm flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs break-all">{h.url}</div>
                        <Badge
                          variant={
                            h.status >= 300 && h.status < 400
                              ? "secondary"
                              : h.status >= 400
                                ? "destructive"
                                : "default"
                          }
                        >
                          {h.status} {h.statusText}
                        </Badge>
                      </div>
                      {h.location && (
                        <div className="text-xs text-muted-foreground break-all">
                          ➜ <span className="font-mono">{h.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta preview */}
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  readOnly
                  label="Page Title"
                  value={meta?.title || meta?.ogTitle || ""}
                  placeholder="_"
                />

                <InputField
                  readOnly
                  label="Content Type"
                  value={meta?.contentType || ""}
                  placeholder="_"
                />

                <TextareaField
                  readOnly
                  className="min-h-[80px]"
                  label="Description"
                  value={meta?.ogDescription || meta?.description || ""}
                  placeholder="—"
                />

                {!!meta?.ogImage && (
                  <div className="sm:col-span-2">
                    <Label>Preview Image</Label>
                    <div className="mt-2 rounded-lg border p-3">
                      <picture>
                        <img
                          src={meta.ogImage}
                          alt="Open Graph"
                          className="max-h-64 w-full object-contain rounded-md"
                        />
                      </picture>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </GlassCard>

      <Separator />

      {/* History */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Recent lookups (last 20). Data stays in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <ExportCSVButton
              filename="link-expand-history.csv"
              getRows={getHistoryRows}
              label="Export CSV"
            />
          </div>

          <div
            className={cn(
              "rounded-md border overflow-hidden",
              history.length ? "" : "p-3 text-sm text-muted-foreground",
            )}
          >
            {!history.length && "No history yet."}
            {!!history.length && (
              <div className="divide-y">
                {history.map((h, i) => (
                  <div
                    key={i as number}
                    className="p-3 text-sm grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        {new Date(h.startedAt).toLocaleString()} • {h.ms} ms • {h.totalHops} hop
                        {h.totalHops === 1 ? "" : "s"}
                      </div>
                      <div className="mt-1 line-clamp-1 break-all">{h.inputUrl}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 break-all">
                        {h.finalUrl}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <ActionButton label="View" size="sm" onClick={() => setResult(h)} />
                      <LinkButton href={h.finalUrl} label="Open" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
