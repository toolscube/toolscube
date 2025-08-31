'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { BookText, Building2, Check, Copy, DollarSign, Download, Globe, Image as ImageIcon, Link as LinkIcon, Package, RotateCcw, Sparkles, Star, Users } from 'lucide-react';

// ---------------- Types ----------------
type SchemaType = 'Article' | 'Product' | 'Organization';

type Base = {
  context: 'https://schema.org';
  type: SchemaType;
};

type ArticleState = {
  headline: string;
  description: string;
  authorName: string;
  authorUrl: string;
  publisherName: string;
  publisherLogo: string;
  datePublished: string; // YYYY-MM-DD or ISO
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
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued' | '';
  condition: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition' | '';
  seller: string;
  // ratings
  ratingValue: string;
  reviewCount: string;
};

type OrgState = {
  name: string;
  url: string;
  logo: string;
  sameAs: string; // newline or comma list
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

// ---------------- Defaults ----------------
const DEFAULT: State = {
  active: 'Article',
  pretty: true,
  article: {
    headline: 'How to Grow Indoor Plants (Beginner Guide)',
    description: 'A beginner-friendly guide to growing healthy indoor plants, including light, watering, and soil tips.',
    authorName: 'Alex Green',
    authorUrl: 'https://example.com/authors/alex-green',
    publisherName: 'Example Media',
    publisherLogo: 'https://example.com/logo.png',
    datePublished: '2025-02-10',
    dateModified: '2025-02-12',
    url: 'https://example.com/blog/indoor-plants',
    images: 'https://example.com/og/indoor-plants.jpg',
    section: 'Home & Garden',
    isAccessibleForFree: true,
  },
  product: {
    name: 'UltraComfort Ergonomic Chair',
    description: 'An ergonomic office chair with lumbar support, adjustable height, and breathable mesh back.',
    sku: 'UC-CHAIR-001',
    brand: 'UltraComfort',
    url: 'https://shop.example.com/products/ergonomic-chair',
    images: 'https://shop.example.com/images/chair-1.jpg\nhttps://shop.example.com/images/chair-2.jpg',
    price: '199.99',
    priceCurrency: 'USD',
    availability: 'InStock',
    condition: 'NewCondition',
    seller: 'Example Store',
    ratingValue: '4.6',
    reviewCount: '128',
  },
  org: {
    name: 'Example Company',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: 'https://twitter.com/example, https://www.linkedin.com/company/example, https://github.com/example',
    contactType: 'customer support',
    telephone: '+1-202-555-0123',
    email: 'support@example.com',
    addressStreet: '123 Market Street',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94103',
    addressCountry: 'US',
  },
};

// ---------------- Helpers ----------------
const esc = (s: string) => s.replaceAll('<', '&lt;'); // minimal; we stringify JSON anyway

function lsSplit(s: string): string[] {
  return s
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function isUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function toScript(json: object, pretty: boolean) {
  const body = pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
  return `<script type="application/ld+json">\n${body}\n</script>`;
}

function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------- JSON-LD builders ----------------
function buildArticle(s: ArticleState) {
  const images = lsSplit(s.images);
  const obj: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': s.url || undefined,
    },
    headline: s.headline || undefined,
    description: s.description || undefined,
    articleSection: s.section || undefined,
    image: images.length ? images : undefined,
    author: s.authorName
      ? {
          '@type': 'Person',
          name: s.authorName,
          url: s.authorUrl || undefined,
        }
      : undefined,
    publisher: s.publisherName
      ? {
          '@type': 'Organization',
          name: s.publisherName,
          logo: s.publisherLogo
            ? {
                '@type': 'ImageObject',
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
  const offers: any = {
    '@type': 'Offer',
    price: s.price || undefined,
    priceCurrency: s.priceCurrency || undefined,
    availability: s.availability ? `https://schema.org/${s.availability}` : undefined,
    itemCondition: s.condition ? `https://schema.org/${s.condition}` : undefined,
    url: s.url || undefined,
    seller: s.seller
      ? {
          '@type': 'Organization',
          name: s.seller,
        }
      : undefined,
  };

  const aggregateRating =
    s.ratingValue && s.reviewCount
      ? {
          '@type': 'AggregateRating',
          ratingValue: s.ratingValue,
          reviewCount: s.reviewCount,
        }
      : undefined;

  const obj: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.name || undefined,
    description: s.description || undefined,
    sku: s.sku || undefined,
    brand: s.brand ? { '@type': 'Brand', name: s.brand } : undefined,
    image: images.length ? images : undefined,
    url: s.url || undefined,
    offers,
    aggregateRating,
  };
  return obj;
}

function buildOrg(s: OrgState) {
  const sameAs = lsSplit(s.sameAs);
  const addressExists = s.addressStreet || s.addressLocality || s.addressRegion || s.postalCode || s.addressCountry;

  const obj: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.name || undefined,
    url: s.url || undefined,
    logo: s.logo || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint:
      s.contactType || s.telephone || s.email
        ? [
            {
              '@type': 'ContactPoint',
              contactType: s.contactType || undefined,
              telephone: s.telephone || undefined,
              email: s.email || undefined,
            },
          ]
        : undefined,
    address: addressExists
      ? {
          '@type': 'PostalAddress',
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

// ---------------- Page ----------------
export default function SchemaGeneratorPage() {
  const [s, setS] = React.useState<State>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('schema-gen-v1');
        if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as State;
      } catch {}
    }
    return DEFAULT;
  });

  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('schema-gen-v1', JSON.stringify(s));
  }, [s]);

  function resetAll() {
    setS(DEFAULT);
    setCopied(false);
  }

  // Build JSON-LD for active type
  const json = React.useMemo(() => {
    if (s.active === 'Article') return buildArticle(s.article);
    if (s.active === 'Product') return buildProduct(s.product);
    return buildOrg(s.org);
  }, [s]);

  const output = React.useMemo(() => toScript(json, s.pretty), [json, s.pretty]);

  async function copyOut() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  // Soft validation counters
  const urlFields =
    s.active === 'Article'
      ? [s.article.url, s.article.publisherLogo, ...lsSplit(s.article.images)]
      : s.active === 'Product'
      ? [s.product.url, ...lsSplit(s.product.images)]
      : [s.org.url, s.org.logo, ...lsSplit(s.org.sameAs)];
  const validUrls = urlFields.filter(isUrl).length;
  const totalUrls = urlFields.filter((x) => x && x.trim()).length;

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6" /> Schema Markup (JSON-LD)
          </h1>
          <p className="text-sm text-muted-foreground">Generate valid JSON-LD for Article, Product, and Organization — copy or download in one click.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={copyOut} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
          </Button>
          <Button onClick={() => downloadTxt('schema.jsonld.html', output)} className="gap-2">
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </GlassCard>

      {/* Type Switcher */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Type</CardTitle>
          <CardDescription>Select a schema type and fill the fields below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(
            [
              ['Article', <BookText key="a" className="h-4 w-4" />],
              ['Product', <Package key="p" className="h-4 w-4" />],
              ['Organization', <Building2 key="o" className="h-4 w-4" />],
            ] as const
          ).map(([label, icon]) => (
            <Button key={label} type="button" variant={s.active === label ? 'default' : 'outline'} className="gap-2" onClick={() => setS((p) => ({ ...p, active: label } as State))}>
              {icon} {label}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Label htmlFor="pretty" className="text-xs text-muted-foreground">
              Pretty print
            </Label>
            <Switch id="pretty" checked={s.pretty} onCheckedChange={(v) => setS((p) => ({ ...p, pretty: v }))} />
          </div>
        </CardContent>
      </GlassCard>

      {/* Dynamic Form */}
      {s.active === 'Article' && <ArticleForm s={s} setS={setS} />}
      {s.active === 'Product' && <ProductForm s={s} setS={setS} />}
      {s.active === 'Organization' && <OrgForm s={s} setS={setS} />}

      <Separator />

      {/* Output & Tips */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generated JSON-LD</CardTitle>
          <CardDescription>
            Embed inside your page’s <code>&lt;head&gt;</code> (or end of <code>&lt;body&gt;</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Textarea readOnly className="min-h-[320px] font-mono text-sm" value={output} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={copyOut}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
              </Button>
              <Button size="sm" className="gap-2" onClick={() => downloadTxt('schema.jsonld.html', output)}>
                <Download className="h-4 w-4" /> Download
              </Button>
              <Badge variant="secondary" className="font-normal">
                URLs valid: {validUrls}/{totalUrls}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tips</Label>
                <p className="text-xs text-muted-foreground">Use absolute URLs for images and pages. Keep JSON-LD in sync with visible content to avoid rich result issues.</p>
              </div>
              <Badge variant="secondary">JSON-LD</Badge>
            </div>

            <div className="rounded-md border p-3">
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>One primary schema per page; avoid conflicting types.</li>
                <li>
                  Dates should be ISO (e.g., <code>2025-02-12</code> or full timestamp).
                </li>
                <li>For Product, include a live price & availability to qualify for rich results.</li>
                <li>
                  For Organization, add <code>sameAs</code> social profiles and a brand logo.
                </li>
                <li>Validate with the Rich Results Test / Schema Markup Validator.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}

// ---------------- Sub-forms ----------------
function ArticleForm({ s, setS }: { s: State; setS: React.Dispatch<React.SetStateAction<State>> }) {
  const a = s.article;
  const setA = (patch: Partial<ArticleState>) => setS((p) => ({ ...p, article: { ...p.article, ...patch } }));

  const imgCount = lsSplit(a.images).length;
  const titleOk = a.headline.trim().length >= 20 && a.headline.trim().length <= 110;

  return (
    <GlassCard className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Article</CardTitle>
        <CardDescription>Headline, author, dates, images, and publisher.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="a-title">Headline</Label>
            <Input id="a-title" value={a.headline} onChange={(e) => setA({ headline: e.target.value })} placeholder="Compelling, descriptive headline" />
            <p className={`text-xs ${titleOk ? 'text-muted-foreground' : 'text-orange-600'}`}>{titleOk ? 'Good length' : 'Aim for 20–110 characters'}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-desc">Description</Label>
            <Textarea id="a-desc" value={a.description} onChange={(e) => setA({ description: e.target.value })} placeholder="Concise summary of the article…" className="min-h-[84px]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-author">Author name</Label>
              <Input id="a-author" value={a.authorName} onChange={(e) => setA({ authorName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-author-url">Author URL</Label>
              <Input id="a-author-url" value={a.authorUrl} onChange={(e) => setA({ authorUrl: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-pub">Publisher</Label>
              <Input id="a-pub" value={a.publisherName} onChange={(e) => setA({ publisherName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-logo">Publisher logo URL</Label>
              <Input id="a-logo" value={a.publisherLogo} onChange={(e) => setA({ publisherLogo: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-pubdate">Published</Label>
              <Input id="a-pubdate" value={a.datePublished} onChange={(e) => setA({ datePublished: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-mod">Modified</Label>
              <Input id="a-mod" value={a.dateModified} onChange={(e) => setA({ dateModified: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Canonical URL
            </Label>
            <Input id="a-url" value={a.url} onChange={(e) => setA({ url: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-img" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Images (one per line or comma)
            </Label>
            <Textarea id="a-img" value={a.images} onChange={(e) => setA({ images: e.target.value })} className="min-h-[84px] font-mono" />
            <p className="text-xs text-muted-foreground">
              {imgCount} image{imgCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-sec">Section</Label>
              <Input id="a-sec" value={a.section} onChange={(e) => setA({ section: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label>Free to read</Label>
              <Switch checked={a.isAccessibleForFree} onCheckedChange={(v) => setA({ isAccessibleForFree: v })} />
            </div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

function ProductForm({ s, setS }: { s: State; setS: React.Dispatch<React.SetStateAction<State>> }) {
  const p = s.product;
  const setP = (patch: Partial<ProductState>) => setS((prev) => ({ ...prev, product: { ...prev.product, ...patch } }));

  const imgCount = lsSplit(p.images).length;

  return (
    <GlassCard className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Product</CardTitle>
        <CardDescription>Core attributes, offers, and ratings.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={p.name} onChange={(e) => setP({ name: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" value={p.description} onChange={(e) => setP({ description: e.target.value })} className="min-h-[84px]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" value={p.sku} onChange={(e) => setP({ sku: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-brand">Brand</Label>
              <Input id="p-brand" value={p.brand} onChange={(e) => setP({ brand: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> URL
              </Label>
              <Input id="p-url" value={p.url} onChange={(e) => setP({ url: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-img" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Images (one per line or comma)
            </Label>
            <Textarea id="p-img" value={p.images} onChange={(e) => setP({ images: e.target.value })} className="min-h-[84px] font-mono" />
            <p className="text-xs text-muted-foreground">
              {imgCount} image{imgCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Offer
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Price</Label>
                <Input id="p-price" value={p.price} onChange={(e) => setP({ price: e.target.value })} placeholder="199.99" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-currency">Currency</Label>
                <Input id="p-currency" value={p.priceCurrency} onChange={(e) => setP({ priceCurrency: e.target.value })} placeholder="USD" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-seller">Seller</Label>
                <Input id="p-seller" value={p.seller} onChange={(e) => setP({ seller: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Availability</Label>
                <div className="flex flex-wrap gap-2">
                  {(['InStock', 'OutOfStock', 'PreOrder', 'Discontinued', ''] as const).map((a) => (
                    <Button key={a || 'none'} type="button" size="sm" variant={p.availability === a ? 'default' : 'outline'} onClick={() => setP({ availability: a })}>
                      {a || 'none'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <div className="flex flex-wrap gap-2">
                  {(['NewCondition', 'UsedCondition', 'RefurbishedCondition', ''] as const).map((c) => (
                    <Button key={c || 'none'} type="button" size="sm" variant={p.condition === c ? 'default' : 'outline'} onClick={() => setP({ condition: c })}>
                      {c || 'none'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Aggregate Rating
            </Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-rating">Rating value</Label>
                <Input id="p-rating" value={p.ratingValue} onChange={(e) => setP({ ratingValue: e.target.value })} placeholder="4.6" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-reviews">Review count</Label>
                <Input id="p-reviews" value={p.reviewCount} onChange={(e) => setP({ reviewCount: e.target.value })} placeholder="128" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Provide both rating value and review count to enable rich results.</p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

function OrgForm({ s, setS }: { s: State; setS: React.Dispatch<React.SetStateAction<State>> }) {
  const o = s.org;
  const setO = (patch: Partial<OrgState>) => setS((prev) => ({ ...prev, org: { ...prev.org, ...patch } }));

  const sameCount = lsSplit(o.sameAs).length;

  return (
    <GlassCard className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Organization</CardTitle>
        <CardDescription>Brand identity, social profiles, contact, and address.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="o-name">Name</Label>
            <Input id="o-name" value={o.name} onChange={(e) => setO({ name: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="o-url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> URL
              </Label>
              <Input id="o-url" value={o.url} onChange={(e) => setO({ url: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-logo">Logo URL</Label>
              <Input id="o-logo" value={o.logo} onChange={(e) => setO({ logo: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="o-same" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Social profiles (one per line or comma)
            </Label>
            <Textarea id="o-same" value={o.sameAs} onChange={(e) => setO({ sameAs: e.target.value })} className="min-h-[84px] font-mono" />
            <p className="text-xs text-muted-foreground">
              {sameCount} profile{sameCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border p-3 space-y-3">
            <Label>Contact</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="o-ctype">Type</Label>
                <Input id="o-ctype" value={o.contactType} onChange={(e) => setO({ contactType: e.target.value })} placeholder="customer support" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-tel">Telephone</Label>
                <Input id="o-tel" value={o.telephone} onChange={(e) => setO({ telephone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-email">Email</Label>
                <Input id="o-email" value={o.email} onChange={(e) => setO({ email: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3 space-y-3">
            <Label>Address</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="o-street">Street</Label>
                <Input id="o-street" value={o.addressStreet} onChange={(e) => setO({ addressStreet: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-city">City</Label>
                <Input id="o-city" value={o.addressLocality} onChange={(e) => setO({ addressLocality: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-region">State/Region</Label>
                <Input id="o-region" value={o.addressRegion} onChange={(e) => setO({ addressRegion: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-postal">Postal code</Label>
                <Input id="o-postal" value={o.postalCode} onChange={(e) => setO({ postalCode: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-country">Country</Label>
                <Input id="o-country" value={o.addressCountry} onChange={(e) => setO({ addressCountry: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
