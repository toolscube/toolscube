import { ToolPageTracker } from "@/components/analytics/tool-page-tracker";
import JsonLd from "@/components/seo/json-ld";
import JSONFormatterClient from "@/components/tools/dev/json-formatter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "JSON Formatter & Validator",
  description:
    "Pretty print, validate, and minify JSON data online. Detect errors, format for readability, and copy/download results instantly. Works fully in your browser.",
  path: "/tools/dev/json-formatter",
  keywords: [
    "JSON formatter",
    "format JSON",
    "pretty print JSON",
    "validate JSON",
    "JSON validator",
    "minify JSON",
    "beautify JSON",
    "parse JSON",
    "JSON lint",
    "JSON viewer",
    "syntax highlight JSON",
    "tree view JSON",
    "collapse expand JSON",
    "convert JSON",
    "JSON editor online",
    "copy JSON",
    "download JSON",
    "developer tools",
    "Tools Cube",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/json-formatter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JSON Formatter & Validator — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online JSON formatter and validator. Pretty-print JSON with syntax highlighting, detect errors, minify, and export results instantly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Pretty print JSON with syntax highlighting",
      "Validate JSON syntax and detect errors",
      "Minify JSON for compact storage",
      "Tree view with expand/collapse nodes",
      "Line numbers & auto-indent formatting",
      "Copy to clipboard or download as .json",
      "Paste or upload JSON files",
      "Large JSON support (MBs of data)",
      "Autosave to local storage",
      "Dark mode, responsive, mobile-friendly",
      "Privacy-first: runs fully in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "EditAction",
      target: toolUrl,
      name: "Format and validate JSON data",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Input", value: "Raw JSON text or file" },
      { "@type": "PropertyValue", name: "Output", value: "Formatted, validated, minified JSON" },
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
      { "@type": "ListItem", position: 3, name: "JSON Formatter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a JSON formatter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A JSON formatter makes raw JSON data human-readable by adding indentation, spacing, and syntax highlighting.",
        },
      },
      {
        "@type": "Question",
        name: "How do I validate JSON?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Paste or upload your JSON into the tool, and it will automatically check for syntax errors and highlight problems.",
        },
      },
      {
        "@type": "Question",
        name: "Can I minify JSON for storage?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool includes a minify option to remove unnecessary spaces and line breaks for compact JSON.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool save my JSON online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs locally in your browser for privacy. Your JSON is never uploaded to a server.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <ToolPageTracker toolName="JSON Formatter" category="Developer" />
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <JSONFormatterClient />
    </div>
  );
}
