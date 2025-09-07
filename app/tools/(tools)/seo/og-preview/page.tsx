"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Twitter,
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

type OgResult = {
  ok: boolean;
  error?: string;
  url?: string; // final URL after redirects
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
  images: string[]; // absolute URLs
  icons: string[]; // favicons
  allMeta: Record<string, string[]>;
};

const EXAMPLES = ["https://nextjs.org", "https://tariqul.dev", "https://youtube.com"];

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
  const [copied, setCopied] = React.useState<"tags" | "json" | null>(null);
  const [noCache, setNoCache] = React.useState(false);

  async function runFetch(u?: string) {
    const target = (u ?? url).trim();
    if (!target) return;
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
    } catch (e: any) {
      setError(e?.message ?? "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setUrl("");
    setData(null);
    setError(null);
    setSelectedImg(0);
    setShowRaw(false);
    setCopied(null);
  }

  async function copyTags() {
    if (!data) return;
    await navigator.clipboard.writeText(toMetaTags(data));
    setCopied("tags");
    setTimeout(() => setCopied(null), 1200);
  }

  async function copyJSON() {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied("json");
    setTimeout(() => setCopied(null), 1200);
  }

  async function pasteUrl() {
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) setUrl(txt.trim());
    } catch {}
  }

  const domain = hostnameOf(data?.url || url);

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6" /> Open Graph Preview
          </h1>
          <p className="text-sm text-muted-foreground">
            Preview OG/Twitter cards for any URL. Server-side fetch avoids CORS; nothing is stored.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={pasteUrl} className="gap-2">
            <LinkIcon className="h-4 w-4" /> Paste URL
          </Button>
          <Button onClick={() => runFetch()} className="gap-2" disabled={!url || loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}{" "}
            Fetch
          </Button>
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enter URL</CardTitle>
          <CardDescription>
            We’ll follow redirects and extract meta tags server-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-domain.com/page"
                onKeyDown={(e) => e.key === "Enter" && runFetch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="nocache" className="text-xs text-muted-foreground">
                Bypass cache
              </Label>
              <Switch id="nocache" checked={noCache} onCheckedChange={setNoCache} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">Try:</span>
            {EXAMPLES.map((e) => (
              <Button
                key={e}
                size="sm"
                variant="outline"
                onClick={() => {
                  setUrl(e);
                  runFetch(e);
                }}
              >
                {e.replace(/^https?:\/\//, "")}
              </Button>
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
          <Separator />

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
                  {/* image */}
                  {data.images[selectedImg] ? (
                    <div className="relative aspect-[1200/630] bg-muted">
                      <img
                        src={data.images[selectedImg]}
                        className="h-full w-full object-cover"
                        alt="OG Image"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[1200/630] grid place-items-center bg-muted text-muted-foreground">
                      <div className="flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4" /> No image found
                      </div>
                    </div>
                  )}

                  {/* text */}
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
                        key={img + i}
                        className={`h-10 w-16 overflow-hidden rounded-md border ${selectedImg === i ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedImg(i)}
                        title={img}
                      >
                        <img
                          src={img}
                          className="h-full w-full object-cover"
                          alt={`thumb ${i + 1}`}
                        />
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
                  {/* header */}
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

                  {/* card */}
                  {data.images[selectedImg] ? (
                    <div className="aspect-video bg-muted">
                      <img
                        src={data.images[selectedImg]}
                        className="h-full w-full object-cover"
                        alt="twitter image"
                      />
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

          {/* Meta & Actions */}
          <GlassCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Extracted Meta</CardTitle>
              <CardDescription>Copy tags, inspect JSON, or open the page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={copyTags}>
                    {copied === "tags" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}{" "}
                    Copy Meta Tags
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={copyJSON}>
                    {copied === "json" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}{" "}
                    Copy JSON
                  </Button>
                  {data.url && (
                    <a href={data.url} target="_blank" rel="noreferrer" className="inline-flex">
                      <Button size="sm" variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" /> Open Page
                      </Button>
                    </a>
                  )}
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
                    {data.canonical && (
                      <a
                        href={data.canonical}
                        className="underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Canonical
                      </a>
                    )}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label>Raw (JSON)</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="raw" className="text-xs text-muted-foreground">
                        Show raw
                      </Label>
                      <Switch id="raw" checked={showRaw} onCheckedChange={setShowRaw} />
                    </div>
                  </div>
                  <div className="mt-2">
                    {showRaw ? (
                      <Textarea
                        readOnly
                        className="min-h-[220px] font-mono text-xs"
                        value={JSON.stringify(data, null, 2)}
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
                        <tr key={k} className="border-t">
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
                      <img key={i + idx} src={i} alt="icon" className="h-5 w-5 rounded" />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </>
      )}
    </MotionGlassCard>
  );
}
