import JsonLd from "@/components/seo/json-ld";
import StandardCalculatorClient from "@/components/tools/calc/standard-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Standard Calculator",
  description:
    "Free online standard calculator for everyday math. Perform basic arithmetic — addition, subtraction, multiplication, and division — with history, keyboard input, and offline support.",
  path: "/tools/calc/standard",
  keywords: [
    "standard calculator",
    "basic calculator",
    "online calculator",
    "math calculator",
    "arithmetic calculator",
    "simple calculator",
    "everyday calculator",
    "addition calculator",
    "subtraction calculator",
    "multiplication calculator",
    "division calculator",
    "percentage calculator",
    "square root calculator",
    "calculator with history",
    "calculator with keyboard support",
    "copy calculator result",
    "offline calculator",
    "mobile calculator",
    "desktop calculator",
    "responsive calculator",
    "Tools Cube",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/standard`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Standard Calculator — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Perform basic arithmetic operations online — addition, subtraction, multiplication, division, and percentages. Free, fast, and offline-capable.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Perform basic arithmetic: add, subtract, multiply, divide",
      "Supports percentages, square roots, and memory functions",
      "Keyboard input support (use numpad/shortcuts)",
      "Calculation history with clear/reset options",
      "Copy result with one click",
      "Dark/light mode support",
      "Responsive design for mobile & desktop",
      "Offline-capable — works without internet",
      "Completely free and privacy-friendly (no data stored)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "UseAction",
      target: toolUrl,
      name: "Calculate numbers online",
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
        name: "Calculators",
        item: `${siteURL}/tools#cat-calculators`,
      },
      { "@type": "ListItem", position: 3, name: "Standard Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a standard calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A standard calculator performs basic arithmetic operations such as addition, subtraction, multiplication, and division. It is suitable for everyday calculations.",
        },
      },
      {
        "@type": "Question",
        name: "Does this calculator work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The calculator runs entirely in your browser and works even without an internet connection.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use my keyboard or numpad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can type numbers and operators directly using your keyboard or numpad for faster input.",
        },
      },
      {
        "@type": "Question",
        name: "Can I copy or save my results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can copy the result with one click and also review previous calculations in the history panel.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <StandardCalculatorClient />
    </div>
  );
}
