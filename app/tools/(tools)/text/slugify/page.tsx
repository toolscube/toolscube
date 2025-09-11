import JsonLd from "@/components/seo/json-ld";
import SlugifyClient from "@/components/tools/text/slugify-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Slugify • Tools Hub",
  description:
    "Create SEO-friendly slugs from text. Live/manual modes, delimiters, transliteration, stopwords, custom rules, casing, max length, and batch processing.",
  path: "/tools/text/slugify",
  keywords: [
    "slugify",
    "slug generator",
    "SEO slug",
    "URL slug",
    "text to slug",
    "create slug online",
    "kebab-case",
    "dash separated",
    "underscore slug",
    "no delimiter slug",
    "lowercase slug",
    "trim length slug",
    "transliterate",
    "remove diacritics",
    "unicode to ascii",
    "normalize accents",
    "stopwords filter",
    "custom replacements",
    "find and replace rules",
    "batch slugify",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/slugify`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Slugify — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Convert titles and phrases into clean, URL-safe slugs with live/manual modes, delimiter control, transliteration, stopwords, custom rules, casing, max length, and batch processing.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Live & Manual modes for instant or controlled output",
      "Delimiter options: dash (-), underscore (_), none (concat)",
      "Casing controls: lowercase, preserve, or custom",
      "Transliteration & diacritics removal (normalize to ASCII)",
      "Stopwords filtering (remove common words)",
      "Custom find → replace rules (regex/plain)",
      "Max length trimming with smart word boundaries",
      "Batch line-by-line slugify with copy/export",
      "Unicode handling & whitespace normalization",
      "Privacy-first: runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate an SEO-friendly slug",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-text` },
      { "@type": "ListItem", position: 3, name: "Slugify", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a slug and why is it useful?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A slug is the URL-friendly version of a title, typically lowercase with hyphens. It improves readability, consistency, and SEO.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support transliteration and diacritics removal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Accented and non-ASCII characters can be normalized to ASCII, making slugs portable and safe across systems.",
        },
      },
      {
        "@type": "Question",
        name: "Can I process multiple slugs at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use batch mode to slugify line-by-line input and then copy or export the results.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <SlugifyClient />
    </div>
  );
}
