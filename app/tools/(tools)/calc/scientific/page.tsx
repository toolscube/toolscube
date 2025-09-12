import JsonLd from "@/components/seo/json-ld";
import ScientificCalculatorClient from "@/components/tools/calc/scientific-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Scientific Calculator",
  description:
    "Advanced scientific calculator for trigonometry, logarithms, exponents, roots, factorials, permutations/combinations, and more. Keyboard-friendly, with history, memory, and rad/deg modes.",
  path: "/tools/calc/scientific",
  keywords: [
    "scientific calculator",
    "advanced calculator",
    "online scientific calculator",
    "math calculator",
    "exponents calculator",
    "powers calculator",
    "roots calculator",
    "square root",
    "cube root",
    "nth root",
    "logarithm calculator",
    "ln calculator",
    "log10 calculator",
    "antilog calculator",
    "trigonometry calculator",
    "sin cos tan",
    "asin acos atan",
    "hyp sin cos tan",
    "radians to degrees",
    "degrees to radians",
    "rad deg mode",
    "factorial calculator",
    "permutation nPr",
    "combination nCr",
    "scientific notation",
    "percent calculator",
    "modulo calculator",
    "constants pi e",
    "parentheses order of operations",
    "keyboard calculator",
    "calculator with history",
    "calculator with memory",
    "Tools Hub",
    "calculators",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/scientific`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Scientific Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Advanced scientific calculator supporting trig, logs, exponents, roots, factorials, permutations/combinations, and more. Keyboard-friendly with history, memory, and rad/deg modes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Full scientific keypad with parentheses and order of operations",
      "Trigonometry: sin, cos, tan, inverse & hyperbolic — radians/degrees toggle",
      "Exponents & roots: x^y, √, ∛, nth-root, scientific notation (×10^n)",
      "Logarithms: ln, log10, arbitrary-base log",
      "Combinatorics: factorial (n!), permutations (nPr), combinations (nCr)",
      "Percent, modulo, absolute value, reciprocal",
      "Math constants: π (pi), e, and memory registers (MC/MR/M+/M-)",
      "History tape with edit & re-evaluate",
      "Keyboard shortcuts & numpad support",
      "Copy results, export history to CSV/JSON",
      "Dark/light mode, responsive layout, mobile-friendly",
      "Offline-capable & privacy-first (runs locally in your browser)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "UseAction",
      target: toolUrl,
      name: "Calculate scientific expressions online",
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
      { "@type": "ListItem", position: 3, name: "Scientific Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does the calculator support radians and degrees?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can switch between radians and degrees. Trigonometric functions respect the mode you select.",
        },
      },
      {
        "@type": "Question",
        name: "Can I type with my keyboard or numpad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Numbers, operators, parentheses, and Enter/Backspace are supported. Use the on-screen help to see shortcuts.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a history and memory feature?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. A history tape records calculations and you can store values using M+, M-, MR, and MC. History can be exported to CSV/JSON.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work offline and is my data private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The calculator is offline-capable and runs locally in your browser. No data is uploaded.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <ScientificCalculatorClient />
    </div>
  );
}
