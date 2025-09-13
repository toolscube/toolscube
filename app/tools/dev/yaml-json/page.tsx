import JsonLd from "@/components/seo/json-ld";
import YamlJsonClient from "@/components/tools/dev/yaml-json-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "YAML ⇄ JSON Converter",
  description:
    "Convert YAML to JSON and JSON to YAML instantly. Paste or upload files, view formatted results, and copy/export easily. Free online converter for developers.",
  path: "/tools/dev/yaml-json",
  keywords: [
    "YAML to JSON",
    "JSON to YAML",
    "YAML converter",
    "JSON converter",
    "convert YAML online",
    "convert JSON online",
    "YAML parser",
    "JSON parser",
    "developer tools",
    "free converter",
    "online YAML JSON converter",
    "copy export YAML JSON",
    "Tools Hub",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/yaml-json`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YAML ⇄ JSON Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online YAML ⇄ JSON converter. Paste or upload YAML/JSON, view the formatted result instantly, and copy or export the output. Privacy-first, runs in your browser.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert YAML → JSON and JSON → YAML",
      "Paste raw text or upload files",
      "Auto-format & syntax highlight",
      "Error detection & validation",
      "Copy or download output",
      "Export as .yaml or .json file",
      "Batch conversion supported",
      "Works offline in browser",
      "No signup, no server storage",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ConvertAction",
      target: toolUrl,
      name: "Convert YAML ⇄ JSON",
    },
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
      { "@type": "ListItem", position: 3, name: "YAML ⇄ JSON Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I convert both YAML to JSON and JSON to YAML?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. This tool supports bi-directional conversion: YAML to JSON and JSON to YAML.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work with large files?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can paste or upload reasonably large YAML/JSON files and convert them instantly in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All conversions are performed locally in your browser. Your data is never uploaded or stored on any server.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <YamlJsonClient />
    </div>
  );
}
