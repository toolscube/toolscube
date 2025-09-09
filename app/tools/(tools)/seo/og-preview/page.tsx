"use client";

import {
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  TrendingUpDown,
  Twitter,
} from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type OgResult = {
  ok: boolean;
  error?: string;
  url?: string;
  status?: number;
  contentType?: string;
  fetchedAt?: string;
  title?: string;
  description?: string;
  siteName?: string;
  ogType?: string;
  canonical?: string;
  twitterCard?: string;
  twitterSite?: string;
  images: string[];
  icons: string[];
  allMeta: Record<string, string[]>;
};

const EXAMPLES = ["https://nextjs.org", "https://tariqul.dev", "https://youtube.com"] as const;

function hostnameOf(u?: string) {
  try {
    return u ? new URL(u).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}

function toMetaTags(meta: OgResult) {
  const lines: string[] = [];
  const esc = (s?: string) =>
    (s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  const title = meta.allMeta["og:title"]?.[0] ?? meta.title ?? "";
  const desc = meta.allMeta["og:description"]?.[0] ?? meta.description ?? "";
  const url = meta.allMeta["og:url"]?.[0] ?? meta.url ?? "";
  const site = meta.allMeta["og:site_name"]?.[0] ?? meta.siteName ?? "";
  const type = meta.allMeta["og:type"]?.[0] ?? meta.ogType ?? "website";

  lines.push(`<meta property="og:title" content="${esc(title)}" />`);
  lines.push(`<meta property="og:description" content="${esc(desc)}" />`);
  if (url) lines.push(`<meta property="og:url" content="${esc(url)}" />`);
  if (site) lines.push(`<meta property="og:site_name" content="${esc(site)}" />`);
  lines.push(`<meta property="og:type" content="${esc(type)}" />`);
  if (meta.images[0]) lines.push(`<meta property="og:image" content="${esc(meta.images[0])}" />`);

  const tTitle = meta.allMeta["twitter:title"]?.[0] ?? title;
  const tDesc = meta.allMeta["twitter:description"]?.[0] ?? desc;
  const tCard =
    meta.allMeta["twitter:card"]?.[0] ?? (meta.images[0] ? "summary_large_image" : "summary");
  const tSite = meta.allMeta["twitter:site"]?.[0] ?? meta.twitterSite ?? "";
  const tImg = meta.allMeta["twitter:image"]?.[0] ?? meta.images[0] ?? "";

  lines.push(`<meta name="twitter:card" content="${esc(tCard)}" />`);
  if (tSite) lines.push(`<meta name="twitter:site" content="${esc(tSite)}" />`);
  if (tTitle) lines.push(`<meta name="twitter:title" content="${esc(tTitle)}" />`);
  if (tDesc) lines.push(`<meta name="twitter:description" content="${esc(tDesc)}" />`);
  if (tImg) lines.push(`<meta name="twitter:image" content="${esc(tImg)}" />`);

  if (meta.canonical) lines.push(`<link rel="canonical" href="${esc(meta.canonical)}" />`);
  if (meta.icons[0]) lines.push(`<link rel="icon" href="${esc(meta.icons[0])}" />`);

  return lines.join("\n");
}

export default function OGPreviewPage() {
  const [url, setUrl] = React.useState("");
  const [data, setData] = React.useState<OgResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedImg, setSelectedImg] = React.useState(0);
  const [showRaw, setShowRaw] = React.useState(false);
  const [noCache, setNoCache] = React.useState(false);
  const [autoFetch, setAutoFetch] = React.useState(false);

  React.useEffect(() => {
    if (!data) return;
    if (selectedImg >= data.images.length) setSelectedImg(0);
  }, [data, selectedImg]);

  const validHttp = /^https?:\/\//i;
  const dataUrl = React.useMemo(() => data?.url ?? "", [data?.url]);

  const runFetch = React.useCallback(
    async (u?: string) => {
      const target = (u ?? url).trim();
      if (!target || !validHttp.test(target)) {
        setError(target ? "Enter a valid absolute URL (https://…)." : null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setData(null);
        setSelectedImg(0);

        const q = new URLSearchParams({
          url: target,
          ...(noCache ? { nocache: "1" } : {}),
        }).toString();
        const res = await fetch(`/api/og-preview?${q}`, { method: "GET" });
        const json = (await res.json()) as OgResult;
        if (!json.ok) {
          setError(json.error || "Failed to fetch metadata.");
          setData(null);
        } else {
          setData(json);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Request failed.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [noCache, url],
  );

  // Auto fetch
  React.useEffect(() => {
    if (!autoFetch || !validHttp.test(url.trim())) return;

    const t = window.setTimeout(() => {
      const current = dataUrl;
      const changedHost = hostnameOf(`${current}/`) !== hostnameOf(`${url}/`);

      if (changedHost || !data) {
        void runFetch(url);
      }
    }, 600);

    return () => window.clearTimeout(t);
  }, [autoFetch, url, runFetch, data, dataUrl]);

  function resetAll() {
    setUrl("");
    setData(null);
    setError(null);
    setSelectedImg(0);
    setShowRaw(false);
  }

  const domain = hostnameOf(data?.url || url);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Sparkles}
        title="Open Graph Preview"
        description="Preview OG/Twitter cards for any URL. Server-side fetch avoids CORS; nothing is stored."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              icon={loading ? Loader2 : autoFetch ? Sparkles : TrendingUpDown}
              label={loading ? "Fetching…" : autoFetch ? "Auto fetch" : "Fetch"}
              onClick={() => runFetch()}
              disabled={!url || loading}
              className={loading ? "animate-pulse" : ""}
            />
          </>
        }
      />

      {/* Input */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enter URL</CardTitle>
          <CardDescription>
            We’ll follow redirects and extract meta tags server-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex-1">
              <InputField
                id="target-url"
                icon={LinkIcon}
                label="Target URL"
                placeholder="https://your-domain.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void runFetch();
                }}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 md:w-[340px]">
              <SwitchRow label="Bypass cache" checked={noCache} onCheckedChange={setNoCache} />
              <SwitchRow label="Auto fetch" checked={autoFetch} onCheckedChange={setAutoFetch} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {EXAMPLES.map((e) => (
              <ActionButton
                key={e}
                size="sm"
                label={e.replace(/^https?:\/\//, "")}
                onClick={() => {
                  setUrl(e);
                  if (!autoFetch) void runFetch(e);
                }}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </GlassCard>

      {/* Results */}
      {data && (
        <>
          <Separator className="my-4" />

          <GlassCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>
                Facebook/LinkedIn (OG) and Twitter cards using extracted tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              {/* OG Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Open Graph (Facebook/LinkedIn)
                    </Label>
                    <p className="text-xs text-muted-foreground">{domain}</p>
                  </div>
                  <Badge variant="secondary">1200×630</Badge>
                </div>

                <div className="rounded-xl border bg-background overflow-hidden">
                  {data.images[selectedImg] ? (
                    <div className="relative aspect-[1200/630] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <picture>
                        <img
                          src={data.images[selectedImg]}
                          className="h-full w-full object-cover"
                          alt="OG"
                        />
                      </picture>
                    </div>
                  ) : (
                    <div className="aspect-[1200/630] grid place-items-center bg-muted text-muted-foreground">
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4" /> No image found
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="text-xs text-muted-foreground">{data.siteName || domain}</div>
                    <div className="mt-1 line-clamp-2 font-semibold">
                      {data.title || "(no title)"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {data.description || "(no description)"}
                    </div>
                  </div>
                </div>

                {/* image picker */}
                <div className="flex flex-wrap items-center gap-2">
                  {data.images.length > 0 ? (
                    data.images.map((img, i) => (
                      <button
                        key={`${img}-${i as number}`}
                        className={`h-10 w-16 overflow-hidden rounded-md border ${selectedImg === i ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedImg(i)}
                        title={img}
                        type="button"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <picture>
                          <img
                            src={img}
                            className="h-full w-full object-cover"
                            alt={`thumb ${i + 1}`}
                          />
                        </picture>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No images to pick.</span>
                  )}
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> Twitter Card
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {data.twitterCard || (data.images[0] ? "summary_large_image" : "summary")}
                    </p>
                  </div>
                  <Badge variant="secondary">Summary Large</Badge>
                </div>

                <div className="rounded-xl border bg-background overflow-hidden">
                  <div className="flex items-center gap-2 p-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {data.siteName || domain || "Website"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {hostnameOf(data.url)}
                      </div>
                    </div>
                  </div>

                  {data.images[selectedImg] ? (
                    <div className="aspect-video bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <picture>
                        <img
                          src={data.images[selectedImg]}
                          className="h-full w-full object-cover"
                          alt="twitter"
                        />
                      </picture>
                    </div>
                  ) : (
                    <div className="aspect-video grid place-items-center bg-muted text-muted-foreground">
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4" /> No image
                      </div>
                    </div>
                  )}

                  <div className="p-3">
                    <div className="text-sm font-semibold line-clamp-2">
                      {data.title || "(no title)"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {data.description || "(no description)"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{hostnameOf(data.url)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <Separator className="my-4" />

          {/* Meta & Actions */}
          <GlassCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Extracted Meta</CardTitle>
              <CardDescription>Copy tags, inspect JSON, or open the page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    size="sm"
                    label="Copy Meta Tags"
                    disabled={!data}
                    getText={toMetaTags(data)}
                  />
                  <CopyButton
                    size="sm"
                    label="Copy JSON"
                    disabled={!data}
                    getText={JSON.stringify(data, null, 2)}
                  />

                  {data.url && <LinkButton size="sm" href={data.url} />}
                </div>

                <div className="rounded-md border p-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {data.status ?? "—"} {data.contentType ? `· ${data.contentType}` : ""}
                    </Badge>
                    {data.fetchedAt && (
                      <span className="text-muted-foreground">
                        Fetched: {new Date(data.fetchedAt).toLocaleString()}
                      </span>
                    )}
                    {data.canonical && <LinkButton label="Canonical" href={data.canonical} />}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label>Raw (JSON)</Label>
                    <SwitchRow label="Show raw" checked={showRaw} onCheckedChange={setShowRaw} />
                  </div>

                  <div className="mt-2">
                    {showRaw ? (
                      <TextareaField
                        id="raw-json"
                        readOnly
                        value={JSON.stringify(data, null, 2)}
                        textareaClassName="min-h-[400px] font-mono"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Toggle to inspect all extracted meta keys and values.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Key Tags</Label>
                    <p className="text-xs text-muted-foreground">
                      Primary OG/Twitter fields detected.
                    </p>
                  </div>
                  <Badge variant="secondary">{Object.keys(data.allMeta).length} tags</Badge>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-2 px-3 w-[40%]">Tag</th>
                        <th className="py-2 px-3">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["og:title", data.allMeta["og:title"]?.[0] ?? data.title ?? ""],
                        [
                          "og:description",
                          data.allMeta["og:description"]?.[0] ?? data.description ?? "",
                        ],
                        ["og:image", data.images[0] ?? ""],
                        ["og:site_name", data.allMeta["og:site_name"]?.[0] ?? data.siteName ?? ""],
                        ["og:url", data.allMeta["og:url"]?.[0] ?? data.url ?? ""],
                        [
                          "twitter:card",
                          data.allMeta["twitter:card"]?.[0] ??
                            (data.images[0] ? "summary_large_image" : "summary"),
                        ],
                        ["twitter:title", data.allMeta["twitter:title"]?.[0] ?? data.title ?? ""],
                        [
                          "twitter:description",
                          data.allMeta["twitter:description"]?.[0] ?? data.description ?? "",
                        ],
                        [
                          "twitter:image",
                          data.allMeta["twitter:image"]?.[0] ?? data.images[0] ?? "",
                        ],
                      ].map(([k, v]) => (
                        <tr key={k as string} className="border-t">
                          <td className="py-2 px-3 font-mono text-xs">{k}</td>
                          <td className="py-2 px-3 break-all">
                            {v || <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.icons?.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Icons:</span>
                    {data.icons.slice(0, 4).map((i, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <picture key={`${i}-${idx as number}`}>
                        <img src={i} alt="icon" className="h-5 w-5 rounded" />
                      </picture>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </>
      )}
    </>
  );
}
