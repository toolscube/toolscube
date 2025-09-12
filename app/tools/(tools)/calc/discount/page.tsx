import JsonLd from "@/components/seo/json-ld";
import DiscountFinderClient from "@/components/tools/calc/discount-finder-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Discount Finder",
  description:
    "Calculate before/after price, savings amount, and savings percentage. Stack multiple discounts, add tax, compare deals, and copy/share results.",
  path: "/tools/calc/discount",
  keywords: [
    "discount calculator",
    "discount finder",
    "before and after price",
    "price after discount",
    "savings calculator",
    "percent off calculator",
    "sale price calculator",
    "markdown calculator",
    "clearance calculator",
    "stacked discounts",
    "coupon plus sale",
    "buy one get one",
    "BOGO calculator",
    "tax and discount",
    "add/remove VAT",
    "compare deals",
    "final price calculator",
    "find discount percentage",
    "what percent off",
    "reverse discount",
    "original price from discount",
    "Tools Hub",
    "calculators",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/discount`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Discount Finder — Tools Hub",
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Compute sale price, savings, and discount percent. Supports stacked discounts, coupons, taxes, and quick comparison of multiple deals.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Before/after price with savings amount and savings %",
      "Stack multiple discounts (e.g., 20% + extra 10%) in correct order",
      "Coupons as flat amount or percentage",
      "Tax/VAT toggle: apply before or after discount",
      "Reverse mode: find original price or discount %",
      "Compare multiple deals side by side",
      "Rounding options for price endings (.99, .95)",
      "Copy/share summary; export CSV/JSON; print-friendly",
      "Mobile-friendly, dark mode, and offline-capable",
      "Privacy-first: runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate discount and final price",
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
      { "@type": "ListItem", position: 3, name: "Discount Finder", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do stacked discounts work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stacked discounts apply sequentially, not additively. For example, 20% off followed by another 10% off is a combined 28% reduction, not 30%.",
        },
      },
      {
        "@type": "Question",
        name: "Should tax be applied before or after discount?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This depends on local rules and the store’s policy. The tool lets you switch between pre-discount or post-discount tax to match your situation.",
        },
      },
      {
        "@type": "Question",
        name: "Can I find the original price from a discounted price?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use reverse mode to input final price and discount percent (or amount) to compute the original price.",
        },
      },
      {
        "@type": "Question",
        name: "Can I compare multiple deals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Add multiple scenarios to compare their final prices and savings, then export or print the comparison table.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <DiscountFinderClient />
    </div>
  );
}
