import JsonLd from "@/components/seo/json-ld";
import IdGeneratorClient from "@/components/tools/util/id-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "GUID / UUID / Order ID Generator",
  description:
    "Generate random GUIDs, UUIDs (v1, v4), NanoIDs, and readable Order IDs instantly. Batch generate, copy, and export. Secure and free.",
  path: "/tools/util/id-generator",
  keywords: [
    "GUID generator",
    "UUID generator",
    "UUID v1 generator",
    "UUID v4 generator",
    "random ID generator",
    "short ID generator",
    "order ID generator",
    "unique ID generator",
    "NanoID generator",
    "MongoDB ObjectID generator",
    "secure ID generator",
    "transaction ID generator",
    "batch ID generator",
    "copy GUID online",
    "generate multiple UUIDs",
    "UUID export CSV",
    "UUID export JSON",
    "unique identifier generator",
    "free online ID generator",
    "Tools Cube",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/util/id-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GUID / UUID / Order ID Generator — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Generate unique identifiers like GUID, UUID (v1/v4), NanoID, or short Order IDs. Copy instantly, batch generate, and export to CSV/JSON.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Generate UUID v1 (timestamp-based) and UUID v4 (random-based)",
      "Generate GUIDs compatible with Microsoft/Windows systems",
      "Readable short Order IDs for invoices or e-commerce",
      "NanoID and MongoDB ObjectID support",
      "Customizable prefix and suffix for IDs",
      "Batch generation of multiple IDs at once",
      "One-click copy to clipboard",
      "Export to CSV or JSON for bulk usage",
      "Printable ID list in clean format",
      "Mobile-friendly and privacy-first (runs locally in your browser)",
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
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Utilities",
        item: `${siteURL}/tools#cat-utilities`,
      },
      { "@type": "ListItem", position: 3, name: "GUID / Order ID Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What’s the difference between UUID v1 and UUID v4?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "UUID v1 is timestamp-based and includes device identifiers, while UUID v4 is completely random. Both are globally unique.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate multiple IDs at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool supports batch generation of GUIDs, UUIDs, or Order IDs, and lets you export them to CSV or JSON.",
        },
      },
      {
        "@type": "Question",
        name: "Are the generated IDs secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. UUID v4 and NanoID use strong randomness for secure unique ID generation. Everything runs locally in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "What are Order IDs used for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Order IDs are shorter, human-friendly identifiers often used in e-commerce invoices, receipts, or transaction references.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <IdGeneratorClient />
    </div>
  );
}
