import JsonLd from "@/components/seo/json-ld";
import UnitPriceClient from "@/components/tools/util/unit-price-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Unit Price Compare • Tools Hub",
  description:
    "Find the cheapest option instantly by comparing unit prices. Enter price, quantity, and unit to calculate cost per kg, liter, or piece. Supports discounts and taxes.",
  path: "/tools/util/unit-price",
  keywords: [
    "unit price calculator",
    "price per kg",
    "price per liter",
    "price per gram",
    "price per ml",
    "price per piece",
    "compare unit prices",
    "unit price comparison",
    "product price comparison",
    "bulk vs small pack",
    "cheaper product size",
    "grocery savings calculator",
    "shopping calculator",
    "supermarket unit price",
    "cost per ounce calculator",
    "price comparison shopping",
    "discount price calculator",
    "tax inclusive price calculator",
    "multi-product price compare",
    "custom units price compare",
    "price per 100g calculator",
    "price per serving calculator",
    "Tools Hub",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/util/unit-price`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Unit Price Compare — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Easily compare product unit prices (per gram, kg, ml, liter, or piece) to see which option offers better value. Supports discounts, taxes, and custom units.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Compare prices per gram, kg, ml, liter, or piece",
      "Supports custom units (e.g., per serving, per pack)",
      "Instantly see which product size is cheaper",
      "Handles discounts and tax-inclusive/exclusive prices",
      "Multi-product comparison in one view",
      "Highlight cheapest option automatically",
      "Copy or export results to CSV/JSON",
      "Printable shopping comparison sheet",
      "Autosave last entries in local storage",
      "Works offline — privacy-friendly (no signup)",
      "Mobile-friendly responsive UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Compare unit prices",
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
      { "@type": "ListItem", position: 3, name: "Unit Price Compare", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I calculate unit price?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To calculate unit price, divide the total price by the quantity (e.g., price ÷ grams, liters, or pieces). This tool does it instantly for you.",
        },
      },
      {
        "@type": "Question",
        name: "Does the calculator support discounts and taxes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can include discounts or tax adjustments to calculate more accurate unit prices.",
        },
      },
      {
        "@type": "Question",
        name: "Can I compare multiple products at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can add multiple products and instantly see which option gives better value.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All calculations are done in your browser. Your inputs remain private unless you export them.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <UnitPriceClient />
    </div>
  );
}
