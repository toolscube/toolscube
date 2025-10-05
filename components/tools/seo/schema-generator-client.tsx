"use client";

import {
  BookText,
  Building2,
  DollarSign,
  Download,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
  Sparkles,
  Star,
  Users,
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

// Types
type SchemaType = "Article" | "Product" | "Organization";

type ArticleState = {
  headline: string;
  description: string;
  authorName: string;
  authorUrl: string;
  publisherName: string;
  publisherLogo: string;
  datePublished: string;
  dateModified: string;
  url: string;
  images: string;
  section: string;
  isAccessibleForFree: boolean;
};

type ProductState = {
  name: string;
  description: string;
  sku: string;
  brand: string;
  url: string;
  images: string;
  // offers
  price: string;
  priceCurrency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued" | "";
  condition: "NewCondition" | "UsedCondition" | "RefurbishedCondition" | "";
  seller: string;
  ratingValue: string;
  reviewCount: string;
};

type OrgState = {
  name: string;
  url: string;
  logo: string;
  sameAs: string;
  contactType: string;
  telephone: string;
  email: string;
  addressStreet: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
};

type State = {
  active: SchemaType;
  pretty: boolean;
  article: ArticleState;
  product: ProductState;
  org: OrgState;
};

// Defaults
const DEFAULT: State = {
  active: "Article",
  pretty: true,

  article: {
    headline: "Tools Cube — Fast, Free, Privacy-Friendly Online Tools",
    description:
      "URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators — all in one place.",
    authorName: "Tariqul Islam",
    authorUrl: "https://tariqul.dev",
    publisherName: "Tools Cube",
    publisherLogo: "https://toolscube.app/og/tools-cube-og.png",
    datePublished: "2025-02-10",
    dateModified: "2025-02-12",
    url: "https://toolscube.app",
    images: "https://toolscube.app/og/tools-cube-og.png",
    section: "UtilitiesApplication",
    isAccessibleForFree: true,
  },

  product: {
    name: "Tools Cube",
    description:
      "Privacy-friendly web utilities: URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators.",
    sku: "TC-0001",
    brand: "Tools Cube",
    url: "https://toolscube.app",
    images: "https://toolscube.app/og/tools-cube-og.png",
    price: "0",
    priceCurrency: "USD",
    availability: "InStock",
    condition: "NewCondition",
    seller: "Tools Cube",
    ratingValue: "0",
    reviewCount: "0",
  },

  org: {
    name: "Tools Cube",
    url: "https://toolscube.app",
    logo: "https://toolscube.app/og/tools-cube-og.png",
    sameAs:
      "https://tariqul.dev, https://www.linkedin.com/in/tariqul-dev, https://github.com/tariqul420",
    contactType: "customer support",
    telephone: "+8801743892058",
    email: "tariqul@tariqul.dev",
    addressStreet: "Pabna, Bangladesh",
    addressLocality: "Pabna, Bangladesh",
    addressRegion: "Bangladeshi",
    postalCode: "6630",
    addressCountry: "BD",
  },
};

// Helpers
function lsSplit(s: string): string[] {
  return s
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function isUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function toScript(json: object, pretty: boolean) {
  const body = pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
  return `<script type="application/ld+json">\n${body}\n</script>`;
}

// JSON-LD builders
function buildArticle(s: ArticleState) {
  const images = lsSplit(s.images);
  const obj = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": s.url || undefined,
    },
    headline: s.headline || undefined,
    description: s.description || undefined,
    articleSection: s.section || undefined,
    image: images.length ? images : undefined,
    author: s.authorName
      ? {
          "@type": "Person",
          name: s.authorName,
          url: s.authorUrl || undefined,
        }
      : undefined,
    publisher: s.publisherName
      ? {
          "@type": "Organization",
          name: s.publisherName,
          logo: s.publisherLogo
            ? {
                "@type": "ImageObject",
                url: s.publisherLogo,
              }
            : undefined,
        }
      : undefined,
    datePublished: s.datePublished || undefined,
    dateModified: s.dateModified || undefined,
    isAccessibleForFree: s.isAccessibleForFree,
  };
  return obj;
}

function buildProduct(s: ProductState) {
  const images = lsSplit(s.images);
  const offers = {
    "@type": "Offer",
    price: s.price || undefined,
    priceCurrency: s.priceCurrency || undefined,
    availability: s.availability ? `https://schema.org/${s.availability}` : undefined,
    itemCondition: s.condition ? `https://schema.org/${s.condition}` : undefined,
    url: s.url || undefined,
    seller: s.seller
      ? {
          "@type": "Organization",
          name: s.seller,
        }
      : undefined,
  };

  const aggregateRating =
    s.ratingValue && s.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: s.ratingValue,
          reviewCount: s.reviewCount,
        }
      : undefined;

  const obj = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: s.name || undefined,
    description: s.description || undefined,
    sku: s.sku || undefined,
    brand: s.brand ? { "@type": "Brand", name: s.brand } : undefined,
    image: images.length ? images : undefined,
    url: s.url || undefined,
    offers,
    aggregateRating,
  };
  return obj;
}

function buildOrg(s: OrgState) {
  const sameAs = lsSplit(s.sameAs);
  const addressExists =
    s.addressStreet || s.addressLocality || s.addressRegion || s.postalCode || s.addressCountry;

  const obj = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.name || undefined,
    url: s.url || undefined,
    logo: s.logo || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint:
      s.contactType || s.telephone || s.email
        ? [
            {
              "@type": "ContactPoint",
              contactType: s.contactType || undefined,
              telephone: s.telephone || undefined,
              email: s.email || undefined,
            },
          ]
        : undefined,
    address: addressExists
      ? {
          "@type": "PostalAddress",
          streetAddress: s.addressStreet || undefined,
          addressLocality: s.addressLocality || undefined,
          addressRegion: s.addressRegion || undefined,
          postalCode: s.postalCode || undefined,
          addressCountry: s.addressCountry || undefined,
        }
      : undefined,
  };
  return obj;
}

export default function SchemaGeneratorClient() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("schema-gen-v1");
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  React.useEffect(() => {
    localStorage.setItem("schema-gen-v1", JSON.stringify(s));
  }, [s]);

  function resetAll() {
    setS(DEFAULT);
  }

  // Build JSON-LD for active type
  const json = React.useMemo(() => {
    if (s.active === "Article") return buildArticle(s.article);
    if (s.active === "Product") return buildProduct(s.product);
    return buildOrg(s.org);
  }, [s]);

  const output = React.useMemo(() => toScript(json, s.pretty), [json, s.pretty]);

  // Soft validation counters
  const urlFields =
    s.active === "Article"
      ? [s.article.url, s.article.publisherLogo, ...lsSplit(s.article.images)]
      : s.active === "Product"
        ? [s.product.url, ...lsSplit(s.product.images)]
        : [s.org.url, s.org.logo, ...lsSplit(s.org.sameAs)];
  const validUrls = urlFields.filter(isUrl).length;
  const totalUrls = urlFields.filter((x) => !!x?.trim()).length;

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Sparkles}
        title="Schema Markup (JSON-LD)"
        description="Generate valid JSON-LD for Article, Product, and Organization — copy or download in one click."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton getText={output} />
            <ExportTextButton
              variant="default"
              label="Download"
              getText={() => output}
              filename="schema-jsonld.txt"
            />
          </>
        }
      />

      {/* Type Switcher */}
      <GlassCard className="mb-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Type</CardTitle>
          <CardDescription>Select a schema type and fill the fields below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(
            [
              ["Article", BookText],
              ["Product", Package],
              ["Organization", Building2],
            ] as const
          ).map(([label, icon]) => (
            <ActionButton
              key={label}
              icon={icon}
              label={label}
              variant={s.active === label ? "default" : "outline"}
              onClick={() => setS((p) => ({ ...p, active: label }) as State)}
            />
          ))}
          <SwitchRow
            className="ml-auto"
            checked={s.pretty}
            onCheckedChange={(v) => setS((p) => ({ ...p, pretty: v }))}
            label="Pretty print"
          />
        </CardContent>
      </GlassCard>

      {/* Dynamic Form */}
      {s.active === "Article" && <ArticleForm s={s} setS={setS} />}
      {s.active === "Product" && <ProductForm s={s} setS={setS} />}
      {s.active === "Organization" && <OrgForm s={s} setS={setS} />}

      <Separator className="my-4" />

      {/* Output & Tips */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generated JSON-LD</CardTitle>
          <CardDescription>
            Embed inside your page’s <code>&lt;head&gt;</code> (or end of <code>&lt;body&gt;</code>
            ).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <TextareaField readOnly textareaClassName="min-h-[320px] text-sm" value={output} />
            <div className="flex flex-wrap gap-2">
              <CopyButton size="sm" getText={output} />
              <ExportTextButton
                icon={Download}
                size="sm"
                variant="default"
                label="Download"
                getText={() => output}
                filename="schema-jsonld.txt"
              />
              <Badge variant="secondary" className="font-normal">
                URLs valid: {validUrls}/{totalUrls}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tips</Label>
                <p className="text-xs text-muted-foreground">
                  Use absolute URLs for images and pages. Keep JSON-LD in sync with visible content
                  to avoid rich result issues.
                </p>
              </div>
              <Badge variant="secondary">JSON-LD</Badge>
            </div>

            <div className="rounded-md border p-3">
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>One primary schema per page; avoid conflicting types.</li>
                <li>
                  Dates should be ISO (e.g., <code>2025-02-12</code> or full timestamp).
                </li>
                <li>
                  For Product, include a live price & availability to qualify for rich results.
                </li>
                <li>
                  For Organization, add <code>sameAs</code> social profiles and a brand logo.
                </li>
                <li>Validate with the Rich Results Test / Schema Markup Validator.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

// Sub-forms
function ArticleForm({ s, setS }: { s: State; setS: React.Dispatch<React.SetStateAction<State>> }) {
  const a = s.article;
  const setA = (patch: Partial<ArticleState>) =>
    setS((p) => ({ ...p, article: { ...p.article, ...patch } }));

  const imgCount = lsSplit(a.images).length;
  const titleOk = a.headline.trim().length >= 20 && a.headline.trim().length <= 110;

  return (
    <GlassCard>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Article</CardTitle>
        <CardDescription>Headline, author, dates, images, and publisher.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <InputField
            id="a-title"
            label="Headline"
            placeholder="Compelling, descriptive headline"
            value={a.headline}
            onChange={(e) => setA({ headline: e.target.value })}
            hint={
              <span className={titleOk ? "text-muted-foreground" : "text-orange-600"}>
                {titleOk ? "Good length" : "Aim for 20–110 characters"}
              </span>
            }
          />

          <TextareaField
            id="a-desc"
            label="Description"
            value={a.description}
            onChange={(e) => setA({ description: e.target.value })}
            placeholder="Concise summary of the article…"
            textareaClassName="min-h-[84px]"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              id="a-author"
              label="Author name"
              value={a.authorName}
              onChange={(e) => setA({ authorName: e.target.value })}
            />
            <InputField
              id="a-author-url"
              type="url"
              label="Author URL"
              value={a.authorUrl}
              onChange={(e) => setA({ authorUrl: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              id="a-pub"
              label="Publisher"
              value={a.publisherName}
              onChange={(e) => setA({ publisherName: e.target.value })}
            />
            <InputField
              id="a-logo"
              label="Publisher logo URL"
              value={a.publisherLogo}
              onChange={(e) => setA({ publisherLogo: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              type="date"
              id="a-pubdate"
              label="Published"
              value={a.datePublished}
              onChange={(e) => setA({ datePublished: e.target.value })}
            />
            <InputField
              type="date"
              id="a-mod"
              label="Modified"
              value={a.dateModified}
              onChange={(e) => setA({ dateModified: e.target.value })}
            />
          </div>

          <InputField
            type="url"
            id="a-url"
            icon={LinkIcon}
            label="Canonical URL"
            value={a.url}
            onChange={(e) => setA({ url: e.target.value })}
          />

          <TextareaField
            id="a-img"
            icon={ImageIcon}
            label="Images (one per line or comma)"
            description={`${imgCount} image${imgCount === 1 ? "" : "s"}`}
            value={a.images}
            onChange={(e) => setA({ images: e.target.value })}
            textareaClassName="min-h-[84px] font-mono"
          />

          <div className="grid gap-3 sm:grid-cols-2 items-end">
            <InputField
              id="a-sec"
              label="Section"
              value={a.section}
              onChange={(e) => setA({ section: e.target.value })}
            />
            <SwitchRow
              className="h-fit"
              label="Free to read"
              checked={a.isAccessibleForFree}
              onCheckedChange={(v) => setA({ isAccessibleForFree: v })}
            />
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

function ProductForm({ s, setS }: { s: State; setS: React.Dispatch<React.SetStateAction<State>> }) {
  const p = s.product;
  const setP = (patch: Partial<ProductState>) =>
    setS((prev) => ({ ...prev, product: { ...prev.product, ...patch } }));

  const imgCount = lsSplit(p.images).length;

  const AVAILABILITY_OPTIONS = [
    { label: "In stock", value: "InStock" },
    { label: "Out of stock", value: "OutOfStock" },
    { label: "Pre-order", value: "PreOrder" },
    { label: "Discontinued", value: "Discontinued" },
    { label: "None", value: " " },
  ];

  const CONDITION_OPTIONS = [
    { label: "New", value: "NewCondition" },
    { label: "Used", value: "UsedCondition" },
    { label: "Refurbished", value: "RefurbishedCondition" },
    { label: "None", value: " " },
  ];

  return (
    <GlassCard>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Product</CardTitle>
        <CardDescription>Core attributes, offers, and ratings.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <InputField
            id="p-name"
            label="Name"
            value={p.name}
            onChange={(e) => setP({ name: e.target.value })}
          />

          <TextareaField
            id="p-desc"
            label="Description"
            value={p.description}
            onValueChange={(v) => setP({ description: v })}
            rows={5}
            minHeight="84px"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <InputField
              id="p-sku"
              label="SKU"
              value={p.sku}
              onChange={(e) => setP({ sku: e.target.value })}
            />
            <InputField
              id="p-brand"
              label="Brand"
              value={p.brand}
              onChange={(e) => setP({ brand: e.target.value })}
            />
            <InputField
              id="p-url"
              icon={LinkIcon}
              label="URL"
              value={p.url}
              onChange={(e) => setP({ url: e.target.value })}
            />
          </div>

          <TextareaField
            id="p-img"
            icon={ImageIcon}
            label="Images (one per line or comma)"
            value={p.images}
            description={`${imgCount} image${imgCount === 1 ? "" : "s"}`}
            onValueChange={(v) => setP({ images: v })}
            rows={5}
            textareaClassName="font-mono"
            minHeight="84px"
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Offer */}
          <div className="rounded-md border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Offer
            </Label>

            <div className="grid gap-3 sm:grid-cols-3">
              <InputField
                id="p-price"
                type="number"
                label="Price"
                value={p.price}
                onChange={(e) => setP({ price: e.target.value })}
                placeholder="199.99"
              />
              <InputField
                id="p-currency"
                label="Currency"
                value={p.priceCurrency}
                onChange={(e) => setP({ priceCurrency: e.target.value })}
                placeholder="USD"
              />
              <InputField
                id="p-seller"
                label="Seller"
                value={p.seller}
                onChange={(e) => setP({ seller: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="p-availability"
                label="Availability"
                placeholder="Select availability"
                options={AVAILABILITY_OPTIONS}
                allowClear
                clearLabel="Clear"
                value={p.availability}
                onValueChange={(v) => setP({ availability: (v as typeof p.availability) ?? "" })}
              />

              <SelectField
                id="p-condition"
                label="Condition"
                placeholder="Select condition"
                options={CONDITION_OPTIONS}
                allowClear
                clearLabel="Clear"
                value={p.condition}
                onValueChange={(v) => setP({ condition: (v as typeof p.condition) ?? "" })}
              />
            </div>
          </div>

          {/* Aggregate Rating */}
          <div className="rounded-md border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Aggregate Rating
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                id="p-rating"
                type="number"
                label="Rating value"
                value={p.ratingValue}
                onChange={(e) => setP({ ratingValue: e.target.value })}
                placeholder="4.6"
              />
              <InputField
                id="p-reviews"
                type="number"
                label="Review count"
                value={p.reviewCount}
                onChange={(e) => setP({ reviewCount: e.target.value })}
                placeholder="128"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Provide both rating value and review count to enable rich results.
            </p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

function OrgForm({ s, setS }: { s: State; setS: React.Dispatch<React.SetStateAction<State>> }) {
  const o = s.org;
  const setO = (patch: Partial<OrgState>) =>
    setS((prev) => ({ ...prev, org: { ...prev.org, ...patch } }));

  const sameCount = lsSplit(o.sameAs).length;

  return (
    <GlassCard>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Organization</CardTitle>
        <CardDescription>Brand identity, social profiles, contact, and address.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <InputField
            id="o-name"
            label="Name"
            value={o.name}
            onChange={(e) => setO({ name: e.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              id="o-url"
              icon={Globe}
              label="URL"
              value={o.url}
              onChange={(e) => setO({ url: e.target.value })}
            />
            <InputField
              id="o-logo"
              label="Logo URL"
              value={o.logo}
              onChange={(e) => setO({ logo: e.target.value })}
            />
          </div>

          <TextareaField
            id="o-same"
            icon={Users}
            label="Social profiles (one per line or comma)"
            description={`${sameCount} profile${sameCount === 1 ? "" : "s"}`}
            value={o.sameAs}
            onValueChange={(v) => setO({ sameAs: v })}
            rows={9}
            textareaClassName="font-mono"
            minHeight="200px"
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="rounded-md border p-3 space-y-3">
            <Label>Contact</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <InputField
                id="o-ctype"
                label="Type"
                placeholder="customer support"
                value={o.contactType}
                onChange={(e) => setO({ contactType: e.target.value })}
              />
              <InputField
                id="o-tel"
                label="Telephone"
                value={o.telephone}
                onChange={(e) => setO({ telephone: e.target.value })}
              />
              <InputField
                id="o-email"
                label="Email"
                value={o.email}
                onChange={(e) => setO({ email: e.target.value })}
              />
            </div>
          </div>

          {/* Address */}
          <div className="rounded-md border p-3 space-y-3">
            <Label>Address</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                id="o-street"
                label="Street"
                value={o.addressStreet}
                onChange={(e) => setO({ addressStreet: e.target.value })}
              />
              <InputField
                id="o-city"
                label="City"
                value={o.addressLocality}
                onChange={(e) => setO({ addressLocality: e.target.value })}
              />
              <InputField
                id="o-region"
                label="State/Region"
                value={o.addressRegion}
                onChange={(e) => setO({ addressRegion: e.target.value })}
              />
              <InputField
                id="o-postal"
                label="Postal code"
                value={o.postalCode}
                onChange={(e) => setO({ postalCode: e.target.value })}
              />
              <InputField
                id="o-country"
                label="Country"
                value={o.addressCountry}
                onChange={(e) => setO({ addressCountry: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
