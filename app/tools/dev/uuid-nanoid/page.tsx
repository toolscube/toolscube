import JsonLd from "@/components/seo/json-ld";
import UuidNanoidClient from "@/components/tools/dev/uuid-nanoid-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "UUID / NanoID Generator",
  description:
    "Generate unique UUIDs (v1, v4) and NanoIDs instantly. Copy, export, and batch-generate IDs with full privacy. Works entirely in your browser.",
  path: "/tools/dev/uuid-nanoid",
  keywords: [
    "UUID generator",
    "NanoID generator",
    "unique ID generator",
    "generate UUID",
    "generate NanoID",
    "UUID v1",
    "UUID v4",
    "random ID",
    "short ID",
    "unique identifier",
    "database IDs",
    "API keys",
    "session IDs",
    "user IDs",
    "object IDs",
    "short unique IDs",
    "crypto random IDs",
    "collision resistant ID",
    "developer tools",
    "Tools Cube",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/uuid-nanoid`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "UUID / NanoID Generator — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online tool to generate UUIDs (v1, v4) and NanoIDs. Batch-generate, copy, and export identifiers instantly with no server-side storage.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Generate UUID v1 (time-based) and UUID v4 (random)",
      "Generate NanoIDs (customizable length & alphabet)",
      "Batch mode for generating multiple IDs at once",
      "One-click copy individual or all IDs",
      "Export IDs to CSV, JSON, or TXT",
      "Collision-resistant with cryptographic randomness",
      "Customizable NanoID alphabet and size",
      "Offline by default — no server requests",
      "Lightweight, mobile-friendly, responsive design",
      "Privacy-first: all generation runs in-browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate unique IDs",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "UUID versions", value: "v1 (time-based), v4 (random)" },
      {
        "@type": "PropertyValue",
        name: "NanoID customization",
        value: "Length, alphabet, batch size",
      },
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
      { "@type": "ListItem", position: 3, name: "UUID / NanoID Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the difference between UUID and NanoID?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "UUIDs are standard 128-bit identifiers (commonly v1 or v4). NanoIDs are shorter, URL-friendly unique IDs that can be customized for length and alphabet.",
        },
      },
      {
        "@type": "Question",
        name: "Is this ID generator secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Both UUID v4 and NanoID rely on cryptographically strong randomness, making them secure and collision-resistant.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate multiple IDs at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool supports batch generation, allowing you to produce dozens or hundreds of IDs and export them to CSV, JSON, or TXT.",
        },
      },
      {
        "@type": "Question",
        name: "Does this tool upload my generated IDs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs entirely in your browser. IDs are never uploaded or stored on a server.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <UuidNanoidClient />
    </div>
  );
}
