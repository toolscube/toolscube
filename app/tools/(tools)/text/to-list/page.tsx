import JsonLd from "@/components/seo/json-ld";
import TextToListClient from "@/components/tools/text/text-to-list-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Text to List • Tools Hub",
  description:
    "Split text by commas, newlines, semicolons, or tabs into a clean list. Trim, dedupe, sort, change case, and add prefix/suffix or numbering. Export to CSV or TXT.",
  path: "/tools/text/to-list",
  keywords: [
    "text to list",
    "split text",
    "split by comma",
    "split by newline",
    "split by semicolon",
    "split by tab",
    "tokenize text",
    "list maker",
    "trim whitespace",
    "remove empty items",
    "remove duplicates",
    "dedupe list",
    "sort list A-Z",
    "sort list Z-A",
    "change case list",
    "lowercase uppercase title case",
    "add prefix",
    "add suffix",
    "add numbering",
    "export list CSV",
    "export list TXT",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/to-list`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Text to List — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Convert raw text into a clean list by splitting on commas, newlines, semicolons, or tabs. Trim, dedupe, sort, change case, add prefix/suffix or numbering, and export.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Split text into a list by comma, newline, semicolon, or tab",
      "Trim whitespace, collapse multiple spaces",
      "Remove empty items and deduplicate entries",
      "Sort ascending (A–Z) or descending (Z–A)",
      "Change case: lowercase, UPPERCASE, Title Case",
      "Add custom prefix, suffix, or sequential numbering",
      "Export results to CSV or TXT; copy to clipboard",
      "Privacy-first: runs locally in your browser",
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
      name: "Convert text to a list",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Text", item: `${siteURL}/tools/text` },
      { "@type": "ListItem", position: 3, name: "Text to List", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which delimiters are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can split by comma, newline, semicolon, or tab. In many cases, mixed delimiters are also handled with a unified cleanup pipeline.",
        },
      },
      {
        "@type": "Question",
        name: "Can I remove duplicates and empty items?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can dedupe items case-sensitively or insensitively and automatically remove empty items created during splitting.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export the final list?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Export to CSV or TXT, or copy the cleaned list directly to your clipboard.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <TextToListClient />
    </div>
  );
}
