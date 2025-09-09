"use client";

import {
  Download,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  ListChecks,
  Palette,
  Sparkles,
  Twitter,
  Type,
  User,
  Wand2,
} from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import ColorField from "@/components/shared/color-field";
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
type TwitterCard = "summary" | "summary_large_image" | "app" | "player";
type OgType = "website" | "article" | "product" | "profile" | "video.other";

type State = {
  title: string;
  siteName: string;
  description: string;
  author: string;
  canonical: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsNoSnippet: boolean;
  themeColor: string;
  favicon: string;
  icon32: string;
  icon180: string;
  manifest: string;
  lang: string;
  dir: "ltr" | "rtl";
  useOG: boolean;
  ogType: OgType;
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: string;
  ogImageHeight: string;
  useTwitter: boolean;
  twitterCard: TwitterCard;
  twitterSite: string;
  twitterCreator: string;
  twitterImage: string;
  twitterImageAlt: string;
  viewport: string;
  pretty: boolean;
};

const DEFAULT: State = {
  title: "Tools Hub — Fast, Free, Privacy-Friendly Online Tools",
  siteName: "Tools Hub",
  description:
    "URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators — all in one place.",
  author: "Tariqul Islam",
  canonical: "https://toolshub.dev/tools",
  robotsIndex: true,
  robotsFollow: true,
  robotsNoSnippet: false,

  themeColor: "#0ea5e9",
  favicon: "/favicon.ico",
  icon32: "/icons/icon-32x32.png",
  icon180: "/icons/apple-touch-icon.png",
  manifest: "/site.webmanifest",

  lang: "en",
  dir: "ltr",

  useOG: true,
  ogType: "website",
  ogUrl: "https://toolshub.dev/tools",
  ogImage: "https://toolshub.dev/og-image.jpg",
  ogImageAlt: "Open Graph image",
  ogImageWidth: "1200",
  ogImageHeight: "630",

  useTwitter: true,
  twitterCard: "summary_large_image",
  twitterSite: "@toolshub",
  twitterCreator: "@tariqul_420",
  twitterImage: "https://toolshub.dev/og-image.jpg",
  twitterImageAlt: "Social image",

  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",

  pretty: true,
};

/* Helpers */
const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

const isHttpUrl = (s: string) => /^https?:\/\//i.test((s ?? "").trim());

function robotsValue(s: State) {
  const parts: string[] = [];
  parts.push(s.robotsIndex ? "index" : "noindex");
  parts.push(s.robotsFollow ? "follow" : "nofollow");
  if (s.robotsNoSnippet) parts.push("nosnippet");
  return parts.join(", ");
}

function safeHostname(u?: string) {
  try {
    if (!u) return "";
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

function genMeta(state: State) {
  const s = state;
  const L: string[] = [];

  L.push(`<!-- html lang="${s.lang}" dir="${s.dir}" -->`);

  // Basic
  if (s.title) L.push(`<title>${esc(s.title)}</title>`);
  if (s.description) L.push(`<meta name="description" content="${esc(s.description)}" />`);
  if (s.author) L.push(`<meta name="author" content="${esc(s.author)}" />`);
  if (s.canonical) L.push(`<link rel="canonical" href="${esc(s.canonical)}" />`);
  L.push(`<meta name="robots" content="${robotsValue(s)}" />`);
  if (s.viewport) L.push(`<meta name="viewport" content="${esc(s.viewport)}" />`);

  // Brand / PWA
  if (s.themeColor) L.push(`<meta name="theme-color" content="${esc(s.themeColor)}" />`);
  if (s.favicon) L.push(`<link rel="icon" href="${esc(s.favicon)}" />`);
  if (s.icon32)
    L.push(`<link rel="icon" type="image/png" sizes="32x32" href="${esc(s.icon32)}" />`);
  if (s.icon180) L.push(`<link rel="apple-touch-icon" sizes="180x180" href="${esc(s.icon180)}" />`);
  if (s.manifest) L.push(`<link rel="manifest" href="${esc(s.manifest)}" />`);

  // Open Graph
  if (s.useOG) {
    const ogTitle = s.title;
    const ogDesc = s.description;
    const ogSite = s.siteName;
    if (ogTitle) L.push(`<meta property="og:title" content="${esc(ogTitle)}" />`);
    if (ogDesc) L.push(`<meta property="og:description" content="${esc(ogDesc)}" />`);
    L.push(`<meta property="og:type" content="${esc(s.ogType)}" />`);
    if (s.ogUrl) L.push(`<meta property="og:url" content="${esc(s.ogUrl)}" />`);
    if (ogSite) L.push(`<meta property="og:site_name" content="${esc(ogSite)}" />`);
    if (s.ogImage) L.push(`<meta property="og:image" content="${esc(s.ogImage)}" />`);
    if (s.ogImageAlt) L.push(`<meta property="og:image:alt" content="${esc(s.ogImageAlt)}" />`);
    if (s.ogImageWidth)
      L.push(`<meta property="og:image:width" content="${esc(s.ogImageWidth)}" />`);
    if (s.ogImageHeight)
      L.push(`<meta property="og:image:height" content="${esc(s.ogImageHeight)}" />`);
    if (s.lang) L.push(`<meta property="og:locale" content="${esc(s.lang.replace("-", "_"))}" />`);
  }

  // Twitter
  if (s.useTwitter) {
    L.push(`<meta name="twitter:card" content="${esc(s.twitterCard)}" />`);
    if (s.twitterSite) L.push(`<meta name="twitter:site" content="${esc(s.twitterSite)}" />`);
    if (s.twitterCreator)
      L.push(`<meta name="twitter:creator" content="${esc(s.twitterCreator)}" />`);
    if (s.title) L.push(`<meta name="twitter:title" content="${esc(s.title)}" />`);
    if (s.description)
      L.push(`<meta name="twitter:description" content="${esc(s.description)}" />`);
    const tImg = s.twitterImage || s.ogImage;
    if (tImg) L.push(`<meta name="twitter:image" content="${esc(tImg)}" />`);
    const tAlt = s.twitterImageAlt || s.ogImageAlt;
    if (tAlt) L.push(`<meta name="twitter:image:alt" content="${esc(tAlt)}" />`);
  }

  const out = L.join("\n");
  return s.pretty ? `${out}\n` : out;
}

function charCount(s: string) {
  return s.trim().length;
}

/* Page */
export default function MetaGeneratorPage() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("meta-gen-v1");
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {
        // ignore
      }
    }
    return DEFAULT;
  });

  const output = React.useMemo(() => genMeta(s), [s]);

  React.useEffect(() => {
    localStorage.setItem("meta-gen-v1", JSON.stringify(s));
  }, [s]);

  const titleLen = charCount(s.title);
  const descLen = charCount(s.description);
  const titleOk = titleLen >= 15 && titleLen <= 70;
  const descOk = descLen >= 50 && descLen <= 160;
  const previewImage = s.twitterImage || s.ogImage;

  // Derived / helpers for actions
  const hostname = React.useMemo(
    () => safeHostname(s.canonical || s.ogUrl),
    [s.canonical, s.ogUrl],
  );

  function resetAll() {
    setS(DEFAULT);
  }

  function copyPreviewTags() {
    return output || " ";
  }

  function presetBlog() {
    setS((p) => ({
      ...p,
      ogType: "article",
      twitterCard: "summary_large_image",
      description: p.description || "Short article description.",
    }));
  }

  function presetProduct() {
    setS((p) => ({
      ...p,
      ogType: "product",
      twitterCard: "summary_large_image",
      description: p.description || "Key benefits and highlights.",
    }));
  }

  function presetLanding() {
    setS((p) => ({
      ...p,
      ogType: "website",
      twitterCard: "summary_large_image",
      description: p.description || "Concise, compelling landing page summary.",
    }));
  }

  function syncOgFromBasics() {
    setS((p) => ({
      ...p,
      ogUrl: p.canonical || p.ogUrl,
      ogImage: p.ogImage || p.twitterImage,
      ogImageAlt: p.ogImageAlt || p.twitterImageAlt,
    }));
  }

  function syncTwitterFromOg() {
    setS((p) => ({
      ...p,
      twitterImage: p.twitterImage || p.ogImage,
      twitterImageAlt: p.twitterImageAlt || p.ogImageAlt,
    }));
  }

  // Validation / Warnings
  const warnings = React.useMemo(() => {
    const w: string[] = [];
    if (!s.title.trim()) w.push("Missing title.");
    if (!s.description.trim()) w.push("Missing description.");
    if (!isHttpUrl(s.canonical)) w.push("Canonical should be an absolute URL (https://…).");
    if (s.useOG) {
      if (!isHttpUrl(s.ogUrl)) w.push("OG URL should be an absolute URL.");
      if (!isHttpUrl(s.ogImage)) w.push("OG image should be an absolute URL.");
    }
    if (s.useTwitter) {
      if (s.twitterCard === "summary_large_image" && !(s.twitterImage || s.ogImage)) {
        w.push("Twitter large image card requires an image.");
      }
    }
    if (!titleOk) w.push("Title length: aim for 15–70 characters.");
    if (!descOk) w.push("Description length: aim for 50–160 characters.");
    return w;
  }, [s, titleOk, descOk]);

  const hasWarnings = warnings.length > 0;

  return (
    <>
      <ToolPageHeader
        icon={Sparkles}
        title="Meta Tags Generator"
        description="Head meta preview for SEO & social. Build clean tags for Open Graph + Twitter."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton disabled={!output} getText={copyPreviewTags()} />
            <ExportTextButton
              variant="default"
              disabled={!output}
              label="Download"
              getText={() => output || ""}
              filename="meta-tags.txt"
            />
          </>
        }
      />

      {/* Quick Presets */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick presets</CardTitle>
          <CardDescription>Fast start for common page types.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ActionButton icon={Wand2} label="Blog Post" onClick={presetBlog} />
          <ActionButton icon={Wand2} label="Product Page" onClick={presetProduct} />
          <ActionButton icon={Wand2} label="Landing" onClick={presetLanding} />
          <ActionButton icon={LinkIcon} label="OG ← Basics" onClick={syncOgFromBasics} />
          <ActionButton icon={Twitter} label="Twitter ← OG" onClick={syncTwitterFromOg} />
        </CardContent>
      </GlassCard>

      {/* Basics */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Title, description, canonical, robots & author.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <InputField
              id="title"
              icon={Type}
              label="Title"
              placeholder="Compelling page title"
              value={s.title}
              onChange={(e) => setS((p) => ({ ...p, title: e.target.value }))}
              hint={
                <div className="flex items-center justify-between text-xs">
                  <span className={titleOk ? "text-muted-foreground" : "text-orange-600"}>
                    {titleOk ? "Good length" : "Aim for 15–70 chars"}
                  </span>
                  <span className="text-muted-foreground">{titleLen} chars</span>
                </div>
              }
            />

            <TextareaField
              id="desc"
              label="Description"
              placeholder="Short summary that encourages clicks…"
              value={s.description}
              onValueChange={(v) => setS((p) => ({ ...p, description: v }))}
              minHeight="90px"
              description={
                <div className="flex items-center justify-between text-xs">
                  <span className={descOk ? "text-muted-foreground" : "text-orange-600"}>
                    {descOk ? "Good length" : "Aim for 50–160 chars"}
                  </span>
                  <span className="text-muted-foreground">{descLen} chars</span>
                </div>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                id="site"
                label="Site Name"
                placeholder="Your Site"
                value={s.siteName}
                onChange={(e) => setS((p) => ({ ...p, siteName: e.target.value }))}
              />
              <InputField
                id="author"
                icon={User}
                label="Author"
                placeholder="Your Name / Brand"
                value={s.author}
                onChange={(e) => setS((p) => ({ ...p, author: e.target.value }))}
              />
            </div>

            <InputField
              id="canonical"
              icon={LinkIcon}
              label="Canonical URL"
              placeholder="https://example.com/page"
              value={s.canonical}
              onChange={(e) => setS((p) => ({ ...p, canonical: e.target.value }))}
              hint={
                !isHttpUrl(s.canonical) && s.canonical.trim() !== "" ? (
                  <span className="text-xs text-orange-600">Use absolute URL (https://…)</span>
                ) : undefined
              }
            />

            <div className="rounded-md border p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <SwitchRow
                  label="Index"
                  checked={s.robotsIndex}
                  onCheckedChange={(v) => setS((p) => ({ ...p, robotsIndex: v }))}
                />
                <SwitchRow
                  label="Follow"
                  checked={s.robotsFollow}
                  onCheckedChange={(v) => setS((p) => ({ ...p, robotsFollow: v }))}
                />
                <SwitchRow
                  label="No Snippet"
                  checked={s.robotsNoSnippet}
                  onCheckedChange={(v) => setS((p) => ({ ...p, robotsNoSnippet: v }))}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Robots: {robotsValue(s)}</p>
            </div>
          </div>

          {/* Brand / Locale */}
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" /> Brand & PWA
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField
                  id="theme"
                  icon={Palette}
                  label="Theme Color"
                  value={s.themeColor}
                  onChange={(v) => setS((p) => ({ ...p, themeColor: v }))}
                />
                <InputField
                  id="manifest"
                  label="Manifest"
                  placeholder="/site.webmanifest"
                  value={s.manifest}
                  onChange={(e) => setS((p) => ({ ...p, manifest: e.target.value }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField
                  id="favicon"
                  label="Favicon"
                  placeholder="/favicon.ico"
                  value={s.favicon}
                  onChange={(e) => setS((p) => ({ ...p, favicon: e.target.value }))}
                />
                <InputField
                  id="icon32"
                  label="Icon 32×32"
                  placeholder="/icons/icon-32x32.png"
                  value={s.icon32}
                  onChange={(e) => setS((p) => ({ ...p, icon32: e.target.value }))}
                />
                <InputField
                  id="icon180"
                  label="Apple Touch 180×180"
                  placeholder="/icons/apple-touch-icon.png"
                  value={s.icon180}
                  onChange={(e) => setS((p) => ({ ...p, icon180: e.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Locale & Viewport
              </Label>
              <div className="grid gap-3 sm:grid-cols-3 items-end">
                <InputField
                  id="lang"
                  label="Lang / Locale"
                  placeholder="en, bn, en_US"
                  value={s.lang}
                  onChange={(e) => setS((p) => ({ ...p, lang: e.target.value }))}
                />
                <SelectField
                  id="dir"
                  label="Direction"
                  value={s.dir}
                  onValueChange={(v) => setS((p) => ({ ...p, dir: (v as "ltr" | "rtl") ?? "ltr" }))}
                  options={[
                    { value: "ltr", label: "LTR" },
                    { value: "rtl", label: "RTL" },
                  ]}
                />
                <InputField
                  id="viewport"
                  label="Viewport"
                  value={s.viewport}
                  onChange={(e) => setS((p) => ({ ...p, viewport: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Social */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Social (OG & Twitter)</CardTitle>
          <CardDescription>Configure Open Graph and Twitter cards.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Open Graph */}
          <div className="space-y-4">
            <SwitchRow
              icon={Globe}
              label="Open Graph"
              checked={s.useOG}
              onCheckedChange={(v) => setS((p) => ({ ...p, useOG: v }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="og-type"
                label="Type"
                value={s.ogType}
                onValueChange={(v) => setS((p) => ({ ...p, ogType: (v as OgType) ?? "website" }))}
                options={[
                  { value: "website", label: "Website" },
                  { value: "article", label: "Article" },
                  { value: "product", label: "Product" },
                  { value: "profile", label: "Profile" },
                  { value: "video", label: "Video" },
                  { value: "other", label: " " },
                ]}
              />
              <InputField
                id="ogurl"
                label="OG URL"
                placeholder="https://example.com/page"
                value={s.ogUrl}
                onChange={(e) => setS((p) => ({ ...p, ogUrl: e.target.value }))}
              />
            </div>

            <InputField
              id="ogimg"
              label={
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image (1200×630)
                </span>
              }
              placeholder="https://example.com/og-image.jpg"
              value={s.ogImage}
              onChange={(e) => setS((p) => ({ ...p, ogImage: e.target.value }))}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <InputField
                id="ogw"
                label="Width"
                type="number"
                value={s.ogImageWidth}
                onChange={(e) => setS((p) => ({ ...p, ogImageWidth: e.target.value }))}
              />
              <InputField
                id="ogh"
                label="Height"
                type="number"
                value={s.ogImageHeight}
                onChange={(e) => setS((p) => ({ ...p, ogImageHeight: e.target.value }))}
              />
              <InputField
                id="ogalt"
                label="Alt"
                placeholder="Describe the image"
                value={s.ogImageAlt}
                onChange={(e) => setS((p) => ({ ...p, ogImageAlt: e.target.value }))}
              />
            </div>
          </div>

          {/* Twitter */}
          <div className="space-y-4">
            <SwitchRow
              icon={Twitter}
              label="Twitter"
              checked={s.useTwitter}
              onCheckedChange={(v) => setS((p) => ({ ...p, useTwitter: v }))}
            />

            <SelectField
              id="tw-card"
              label="Card"
              value={s.twitterCard}
              onValueChange={(v) =>
                setS((p) => ({ ...p, twitterCard: (v as TwitterCard) ?? "summary_large_image" }))
              }
              options={[
                { value: "summary", label: "summary" },
                { value: "summary_large_image", label: "summary_large_image" },
                { value: "app", label: "app" },
                { value: "player", label: "player" },
              ]}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                id="twsite"
                label="@site"
                placeholder="@yourbrand"
                value={s.twitterSite}
                onChange={(e) => setS((p) => ({ ...p, twitterSite: e.target.value }))}
              />
              <InputField
                id="twcreator"
                label="@creator"
                placeholder="@yourhandle"
                value={s.twitterCreator}
                onChange={(e) => setS((p) => ({ ...p, twitterCreator: e.target.value }))}
              />
            </div>

            <InputField
              id="twimg"
              label="Image"
              placeholder="https://example.com/social-image.jpg"
              value={s.twitterImage}
              onChange={(e) => setS((p) => ({ ...p, twitterImage: e.target.value }))}
            />
            <InputField
              id="twalt"
              label="Alt"
              placeholder="Describe the image"
              value={s.twitterImageAlt}
              onChange={(e) => setS((p) => ({ ...p, twitterImageAlt: e.target.value }))}
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Live Previews */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          <CardDescription>How it’ll look on OG (Facebook/LinkedIn) and Twitter.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* OG Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Open Graph
                </Label>
                <p className="text-xs text-muted-foreground">
                  {s.siteName || hostname || "Website"}
                </p>
              </div>
              <Badge variant="secondary">1200×630</Badge>
            </div>

            <div className="rounded-xl border bg-background overflow-hidden">
              {previewImage ? (
                <div className="relative aspect-[1200/630] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <picture>
                    <img src={previewImage} alt="OG" className="h-full w-full object-cover" />
                  </picture>
                </div>
              ) : (
                <div className="aspect-[1200/630] grid place-items-center bg-muted text-muted-foreground">
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4" /> No image
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="text-xs text-muted-foreground">
                  {s.siteName || hostname || "Website"}
                </div>
                <div className="mt-1 line-clamp-2 font-semibold">{s.title || "(no title)"}</div>
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {s.description || "(no description)"}
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter Card
                </Label>
                <p className="text-xs text-muted-foreground">{s.twitterCard}</p>
              </div>
              <Badge variant="secondary">Summary</Badge>
            </div>

            <div className="rounded-xl border bg-background overflow-hidden">
              <div className="flex items-center gap-2 p-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.siteName || "Website"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {hostname || "example.com"}
                  </div>
                </div>
              </div>

              {s.twitterCard === "summary_large_image" ? (
                previewImage ? (
                  <div className="aspect-video bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <picture>
                      <img
                        src={previewImage}
                        alt="twitter"
                        className="h-full w-full object-cover"
                      />
                    </picture>
                  </div>
                ) : (
                  <div className="aspect-video grid place-items-center bg-muted text-muted-foreground">
                    <div className="flex items-center gap-2 text-sm">
                      <ImageIcon className="h-4 w-4" /> No image
                    </div>
                  </div>
                )
              ) : null}

              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2">{s.title || "(no title)"}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {s.description || "(no description)"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {hostname || "example.com"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Output + Validation */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generated Tags</CardTitle>
          <CardDescription>Paste these into your page’s &lt;head&gt;.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <TextareaField
              readOnly
              rows={16}
              textareaClassName="font-mono text-sm"
              value={output}
            />
            <div className="flex flex-wrap gap-2">
              <CopyButton size="sm" disabled={!output} getText={output} />
              <ExportTextButton
                size="sm"
                disabled={!output}
                filename="meta-tags.txt"
                getText={() => output}
                icon={Download}
              />
              {s.canonical && isHttpUrl(s.canonical) && <LinkButton size="sm" href={s.canonical} />}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Validation</Label>
                <p className="text-xs text-muted-foreground">
                  Quick checks for common issues. Fix warnings for best results.
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <ListChecks className="h-3.5 w-3.5" />{" "}
                {hasWarnings ? `${warnings.length} issues` : "OK"}
              </Badge>
            </div>

            <div className="rounded-md border p-3">
              {hasWarnings ? (
                <ul className="list-disc pl-5 space-y-1 text-orange-700">
                  {warnings.map((w, i) => (
                    <li key={i as number}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Looks good. No obvious issues found.
                </p>
              )}
            </div>

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Tips</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use <code>summary_large_image</code> for bigger Twitter previews.
                </li>
                <li>Recommended OG image: 1200×630 (≤2MB, JPG/PNG/WebP).</li>
                <li>
                  Make <code>canonical</code> absolute (<code>https://</code>).
                </li>
                <li>
                  For multi-language sites, also add <code>hreflang</code> links.
                </li>
                <li>
                  Host icons at predictable paths and include a <code>manifest</code> for PWA.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
