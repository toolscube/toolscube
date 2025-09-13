import JsonLd from "@/components/seo/json-ld";
import CsvJsonClient from "@/components/tools/dev/csv-json-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "CSV ⇄ JSON Converter",
  description:
    "Convert CSV to JSON and JSON to CSV instantly. Header-aware, delimiter options, pretty-print, schema preview, and copy/export — fast and privacy-first.",
  path: "/tools/dev/csv-json",
  keywords: [
    "CSV to JSON",
    "JSON to CSV",
    "csv json converter",
    "convert csv online",
    "convert json online",
    "csv parser",
    "json parser",
    "tabular to JSON",
    "array of objects",
    "header-aware CSV",
    "custom delimiter",
    "semicolon delimiter",
    "tab delimited",
    "quote escape",
    "newline handling",
    "UTF-8 BOM",
    "pretty print JSON",
    "minify JSON",
    "flatten nested JSON",
    "unflatten JSON",
    "schema preview",
    "type inference",
    "date parse",
    "numbers booleans",
    "null handling",
    "empty fields",
    "skip lines",
    "select columns",
    "reorder columns",
    "dedupe rows",
    "copy to clipboard",
    "download CSV",
    "download JSON",
    "drag and drop",
    "batch convert",
    "large file support",
    "offline converter",
    "developer tools",
    "data tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/csv-json`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CSV ⇄ JSON Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free, header-aware CSV ⇄ JSON converter. Choose delimiters, preview schema, pretty-print/minify, flatten/unflatten, and export results. Runs fully in your browser.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert CSV → JSON (array of objects) and JSON → CSV",
      "Header-aware parsing with custom delimiter (comma, semicolon, tab)",
      "Quote/escape settings, newline handling, UTF-8/BOM support",
      "Preview data & inferred schema (types: string/number/boolean/date/null)",
      "Pretty-print or minify JSON output",
      "Flatten nested JSON for CSV; unflatten back to nested",
      "Select/reorder columns, skip header lines, handle empty values",
      "Dedupe rows by selected key(s)",
      "Copy to clipboard; export CSV/JSON/TXT",
      "Drag & drop files; large file friendly",
      "Dark mode, responsive, keyboard shortcuts",
      "Privacy-first: local processing, works offline",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ConvertAction",
      target: toolUrl,
      name: "Convert CSV ⇄ JSON online",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Inputs", value: "CSV file/text, JSON file/text" },
      { "@type": "PropertyValue", name: "Outputs", value: "JSON array/object, CSV with headers" },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Developer",
        item: `${siteURL}/tools#cat-developer`,
      },
      { "@type": "ListItem", position: 3, name: "CSV ⇄ JSON Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does the tool detect headers automatically?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. By default the first row is treated as headers for CSV→JSON. You can switch to no-headers mode or customize which row contains headers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I change the delimiter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Choose comma, semicolon, or tab — or set a custom delimiter. You can also control quote and escape characters.",
        },
      },
      {
        "@type": "Question",
        name: "How are data types handled?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The schema preview attempts to infer numbers, booleans, dates, and nulls. You can turn inference off to keep everything as strings.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All conversions run locally in your browser. Nothing is stored or transmitted unless you export a file to your device.",
        },
      },
      {
        "@type": "Question",
        name: "Can I flatten nested JSON for CSV export?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enable flatten to convert nested objects/arrays into dot/bracket paths for CSV, and unflatten to reconstruct JSON from CSV later.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <CsvJsonClient />
    </div>
  );
}
