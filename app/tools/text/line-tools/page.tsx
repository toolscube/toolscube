import JsonLd from "@/components/seo/json-ld";
import LineToolsClient from "@/components/tools/text/line-tools-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Line Tools",
  description:
    "Sort, dedupe, trim, filter, and find & replace lines of text online. Natural sort, regex, line numbering, prefix/suffix, shuffle, and more—fast and privacy-friendly.",
  path: "/tools/text/line-tools",
  keywords: [
    "line tools",
    "sort lines",
    "remove duplicate lines",
    "dedupe lines",
    "trim lines",
    "find and replace text",
    "text utilities",
    "clean text online",
    "natural sort lines",
    "reverse lines",
    "shuffle lines",
    "unique lines",
    "remove blank lines",
    "collapse empty lines",
    "case insensitive dedupe",
    "case sensitive dedupe",
    "keep first occurrence",
    "keep last occurrence",
    "regex find replace",
    "regex replace lines",
    "filter lines contains",
    "exclude lines",
    "remove lines matching regex",
    "add line numbers",
    "prefix lines",
    "suffix lines",
    "indent lines",
    "dedent lines",
    "join lines",
    "split to lines",
    "Tools Cube",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/line-tools`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Line Tools — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online line tools to sort, dedupe, trim, filter, and find & replace lines. Includes natural sort, regex, shuffle, numbering, prefix/suffix, and more.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Sort lines: A→Z / Z→A, natural sort, reverse",
      "Dedupe lines: case-sensitive/insensitive, keep first/last",
      "Trim whitespace, remove/collapse blank lines",
      "Find & replace: plain or regex with flags",
      "Filter: keep lines that match; exclude lines that match",
      "Shuffle lines (randomize order)",
      "Add line numbers, custom prefix/suffix",
      "Indent / dedent by spaces or tabs",
      "Join lines with custom delimiter or split by delimiter",
      "Copy to clipboard & download output",
      "Privacy-first: all processing runs in your browser",
      "Fast, mobile-friendly UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "Action",
      target: toolUrl,
      name: "Process lines of text",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-text` },
      { "@type": "ListItem", position: 3, name: "Line Tools", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I remove duplicate lines and keep order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can dedupe while preserving the first or last occurrence, with optional case-insensitive matching to keep the original order.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support regex for find & replace or filtering?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use regular expressions with flags for powerful find/replace and for filtering lines to include or exclude matches.",
        },
      },
      {
        "@type": "Question",
        name: "Is my text uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All operations run locally in your browser for a privacy-friendly workflow.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <LineToolsClient />
    </div>
  );
}
