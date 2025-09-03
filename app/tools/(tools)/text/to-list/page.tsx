import JsonLd from "@/components/seo/json-ld";
import TextToListClient from "@/components/tools/text/text-to-list-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Text to List • Tools Hub",
  description:
    "Split text by comma, newline, semicolon, or tab into a clean list. Trim, dedupe, sort, change case, and add prefix/suffix or numbering. Free online text to list converter.",
  path: "/tools/text/to-list",
  keywords: [
    "text to list",
    "split text",
    "comma separated list",
    "newline separated list",
    "dedupe list",
    "sort list",
    "add prefix suffix",
    "number list",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Text to List — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/to-list`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Free online text to list converter. Split text by commas, newlines, semicolons, or tabs into a clean list. Supports trimming, deduplication, sorting, case conversion, prefix/suffix, and numbering.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Split text into list by comma, newline, semicolon, or tab",
      "Trim whitespace and collapse spaces",
      "Remove empty items and duplicates",
      "Sort A–Z or Z–A",
      "Change case: lowercase, uppercase, title case",
      "Add prefix, suffix, or numbering",
      "Export list to CSV or TXT",
    ],
    creator: {
      "@type": "Personal",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <TextToListClient />
    </div>
  );
}
