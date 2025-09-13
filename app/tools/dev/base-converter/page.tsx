import JsonLd from "@/components/seo/json-ld";
import BaseConverterClient from "@/components/tools/dev/base-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Number Base Converter",
  description:
    "Convert numbers between binary, octal, decimal, and hexadecimal instantly. Free online base converter with copy/export support.",
  path: "/tools/dev/base-converter",
  keywords: [
    "number base converter",
    "binary to decimal",
    "decimal to binary",
    "decimal to hex",
    "hex to decimal",
    "octal converter",
    "binary converter",
    "hexadecimal converter",
    "base converter",
    "programmer calculator",
    "bitwise number converter",
    "developer tools",
    "Tools Hub",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/base-converter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Number Base Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online number base converter. Instantly convert numbers between binary, octal, decimal, and hexadecimal. Includes copy/export support and input validation.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert binary ⇄ decimal ⇄ hex ⇄ octal",
      "Supports negative numbers",
      "Handles large integers",
      "Instant conversion as you type",
      "Copy or export results",
      "Syntax validation & error messages",
      "Mobile-friendly responsive UI",
      "Runs fully in-browser, no signup",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ConvertAction",
      target: toolUrl,
      name: "Convert numbers between binary, decimal, octal, and hex",
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
      { "@type": "ListItem", position: 3, name: "Number Base Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which number systems are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This tool supports binary, octal, decimal, and hexadecimal conversions.",
        },
      },
      {
        "@type": "Question",
        name: "Does it handle very large numbers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The converter can process large integers without losing accuracy.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All conversions are performed locally in your browser. No data is uploaded or saved.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <BaseConverterClient />
    </div>
  );
}
