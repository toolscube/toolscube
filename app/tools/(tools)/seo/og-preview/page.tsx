import JsonLd from "@/components/seo/json-ld";
import OGPreviewClient from "@/components/tools/seo/og-preview-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Open Graph Preview",
  description:
    "Preview how any URL appears on social: Facebook Open Graph, Twitter Cards (X), and LinkedIn. Inspect meta tags, images, redirects, and share debugs.",
  path: "/tools/seo/og-preview",
  keywords: [
    "Open Graph preview",
    "OG preview",
    "Twitter Card preview",
    "LinkedIn preview",
    "social preview generator",
    "meta tag preview",
    "share preview",
    "og:image validator",
    "og:title checker",
    "og:description checker",
    "twitter:card validator",
    "meta tags inspector",
    "redirect chain inspector",
    "http status checker",
    "social media optimization",
    "link share preview",
    "facebook debugger alternative",
    "twitter card validator alternative",
    "linkedin post preview",
    "open graph image size",
    "card large summary",
    "meta charset viewport head",
    "SEO tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/seo/og-preview`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Open Graph Preview — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Preview OG/Twitter/LinkedIn cards for any URL. Inspect meta tags, validate images, see redirect chains and HTTP status, and copy/share debug results.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Real previews for Facebook (OG), Twitter/X (summary & large), and LinkedIn",
      "Parse & list meta tags: og:title, og:description, og:image, og:url, og:type, twitter:*",
      "Image validator: file type, dimensions, size, aspect ratio, warnings for small images",
      "HTTP details: status code, content-type, canonical, robots, lang, favicon",
      "Redirect chain trace with final resolved URL",
      "User-agent emulation (fb, twitterbot, LinkedIn) to detect conditional tags",
      "Multiple images support & selection order",
      "Copy debug summary; export JSON/CSV; print-friendly report",
      "Dark/light mode, responsive UI, privacy-first (runs in your browser)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CheckAction",
      target: toolUrl,
      name: "Preview Open Graph & Twitter Cards",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Validates", value: "min 1200×630 for OG, 600×314+" },
      { "@type": "PropertyValue", name: "Outputs", value: "Preview, tag table, warnings" },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "SEO", item: `${siteURL}/tools#cat-seo` },
      { "@type": "ListItem", position: 3, name: "Open Graph Preview", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why does my OG/Twitter preview look different from production?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Platforms cache previews. After updating meta tags, use each platform’s debugger to refresh cache (e.g., Facebook Sharing Debugger, X Card Validator, LinkedIn Post Inspector).",
        },
      },
      {
        "@type": "Question",
        name: "What size should my Open Graph image be?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A common recommendation is 1200×630 (1.91:1) for Facebook/LinkedIn and 1200×628 for X large summary. Keep images under a few MB and use JPG/PNG/WebP.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need both Open Graph and Twitter tags?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Twitter falls back to Open Graph in many cases, but adding explicit twitter:* tags ensures consistent previews across clients.",
        },
      },
      {
        "@type": "Question",
        name: "Why is my og:image ignored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common reasons: too small dimensions, blocked by robots.txt, 404/redirect loops, non-public URL, or unsupported content-type. The tool flags these issues.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <OGPreviewClient />
    </div>
  );
}
