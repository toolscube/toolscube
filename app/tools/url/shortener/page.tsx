import JsonLd from "@/components/seo/json-ld";
import { ToolPageTracker } from "@/components/analytics/tool-page-tracker";
import ShortenerClient from "@/components/tools/url/shortener-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "URL Shortener",
  description:
    "Shorten URLs with custom slugs, analytics, and QR code export. Fast, privacy-friendly, and free. Paste a link and get a tiny short URL instantly.",
  path: "/tools/url/shortener",
  keywords: [
    "URL shortener",
    "link shortener",
    "short URL",
    "short link",
    "short URL generator",
    "tiny url",
    "free link shortener",
    "custom slug short URL",
    "shorten long URL",
    "UTM shortener",
    "campaign link shortener",
    "bio link shortener",
    "social media short link",
    "QR code link",
    "QR for short URL",
    "link analytics",
    "click tracking",
    "redirect tracking",
    "password protected link",
    "interstitial page",
    "custom domain short link",
    "SVG QR",
    "PNG QR",
    "Tools Cube",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/url/shortener`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "URL Shortener — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Shorten URLs with custom slugs, optional analytics, and QR export. Create tiny links for campaigns and social media with a privacy-first workflow.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Instant short link generation",
      "Custom slug support",
      "Link analytics (click count, referrers, geos — if enabled)",
      "Interstitial/preview page option",
      "Built-in QR generation (PNG/SVG)",
      "UTM-friendly: keep campaign parameters intact",
      "Privacy-first: minimal data, no tracking by default",
      "Copy/share shortcuts and history",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Shorten a URL",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-url` },
      { "@type": "ListItem", position: 3, name: "URL Shortener", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I set a custom slug?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enter your preferred slug when shortening to create a readable, branded short link.",
        },
      },
      {
        "@type": "Question",
        name: "Does it track analytics?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Analytics are optional. If enabled, you can view basic metrics like clicks, referrers, and geographies while preserving user privacy.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create a QR code for my short link?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every short URL can be exported as a QR code in PNG or SVG for easy sharing and print.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <ToolPageTracker toolName="URL Shortener" category="URL" />
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />
      <ShortenerClient />
    </div>
  );
}
