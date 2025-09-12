import JsonLd from "@/components/seo/json-ld";
import PercentageCalculatorClient from "@/components/tools/calc/percentage-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Percentage Calculator",
  description:
    "Free online percentage calculator. Find X% of Y, percentage increase/decrease, percentage change, discounts, and reverse calculations instantly.",
  path: "/tools/calc/percentage",
  keywords: [
    "percentage calculator",
    "percent calculator",
    "find X% of Y",
    "percentage increase",
    "percentage decrease",
    "percentage change",
    "reverse percentage",
    "discount calculator",
    "percent off calculator",
    "sale price calculator",
    "percent difference calculator",
    "what is 20% of 150",
    "add 15% tax calculator",
    "remove 10% discount calculator",
    "percentage to decimal",
    "decimal to percentage",
    "fraction to percentage",
    "Tools Hub",
    "calculators",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/percentage`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Percentage Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Instant percentage calculator. Solve for X% of Y, increase/decrease, percent change, discounts, tax, and reverse percentage problems.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Find X% of Y (e.g., 20% of 150)",
      "Calculate percentage increase or decrease",
      "Find percentage change between two values",
      "Reverse percentage (what number before X% was applied?)",
      "Discount & sale price calculator",
      "Add/remove tax percentage",
      "Convert between percentages, decimals, and fractions",
      "Copy results to clipboard",
      "Export results to CSV/JSON",
      "Mobile-friendly, responsive design",
      "Works offline, privacy-first (no signup)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate percentage online",
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
      { "@type": "ListItem", position: 3, name: "Percentage Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I calculate percentage increase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Subtract the original value from the new value, divide by the original value, and multiply by 100. The tool automates this instantly.",
        },
      },
      {
        "@type": "Question",
        name: "How can I find what X% of Y is?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enter the values for X and Y, and the tool will calculate X% of Y instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this calculator for discounts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enter the discount percentage and the original price to instantly find the final sale price.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The calculator is browser-based and works even without internet access.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <PercentageCalculatorClient />
    </div>
  );
}
