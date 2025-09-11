import JsonLd from "@/components/seo/json-ld";
import CaseConverterClient from "@/components/tools/text/case-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Case Converter • Tools Hub",
  description:
    "Convert text to upper, lower, title, sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more. Includes cleanup, diacritics removal, and copy/export.",
  path: "/tools/text/case-converter",
  keywords: [
    // core intents
    "case converter",
    "text case converter",
    "change text case online",
    "convert to uppercase",
    "convert to lowercase",
    "capitalize text",
    "title case converter",
    "sentence case converter",
    "camelCase",
    "PascalCase",
    "snake_case",
    "kebab-case",
    "CONSTANT_CASE",
    "dot.case",
    "path/case",
    "Train-Case",
    "Header-Case",
    "remove diacritics",
    "normalize whitespace",
    "trim spaces",
    "punctuation cleanup",
    "copy text",
    "download text",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/case-converter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Case Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online case converter with presets and cleanup. Transform text to upper, lower, title, sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Uppercase / Lowercase / Title Case / Sentence case",
      "camelCase / PascalCase / snake_case / kebab-case / CONSTANT_CASE",
      "dot.case / path/case / Train-Case / Header-Case",
      "Whitespace normalization, trim, punctuation cleanup",
      "Remove diacritics (accented characters → ASCII)",
      "Live preview, copy to clipboard, and download output",
      "Privacy-first: runs in your browser",
      "Mobile-friendly UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "Action",
      target: toolUrl,
      name: "Convert text case",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Text", item: `${siteURL}/tools/text` },
      { "@type": "ListItem", position: 3, name: "Case Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which cases are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common cases like UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, Train-Case, and Header-Case.",
        },
      },
      {
        "@type": "Question",
        name: "Can I clean and normalize the text?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can trim spaces, normalize whitespace, clean punctuation, and remove diacritics to standardize text before converting case.",
        },
      },
      {
        "@type": "Question",
        name: "Is my text uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The tool runs locally in your browser for a privacy-friendly workflow.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <CaseConverterClient />
    </div>
  );
}
