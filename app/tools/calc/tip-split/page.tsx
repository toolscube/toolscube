import JsonLd from "@/components/seo/json-ld";
import TipSplitterClient from "@/components/tools/calc/tip-splitter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tip Splitter",
  description:
    "Easily split a bill among friends or colleagues. Add tip %, divide equally or by custom amounts, round up totals, and copy/share results instantly.",
  path: "/tools/calc/tip-split",
  keywords: [
    "tip splitter",
    "bill splitter",
    "split bill calculator",
    "restaurant tip calculator",
    "group bill calculator",
    "split check",
    "split dinner bill",
    "calculate tip",
    "tip percentage calculator",
    "round up bill",
    "split bill by people",
    "split bill unevenly",
    "add custom tip",
    "tip with tax included",
    "tip with tax excluded",
    "group expense calculator",
    "party bill calculator",
    "meal cost sharing",
    "Tools Cube",
    "calculators",
    "finance tools",
    "Bangladesh",
    "online tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/tip-split`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tip Splitter — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Split bills and tips easily with this free tool. Divide evenly or assign custom amounts per person. Supports rounding, tax inclusion/exclusion, and quick copy/share.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Enter total bill and tip percentage",
      "Split evenly among people or assign custom shares",
      "Option to include/exclude tax in tip calculation",
      "Round up or round down amounts for fairness",
      "Copy or share per-person result instantly",
      "Works offline — data stays in your browser",
      "Export results to CSV/JSON",
      "Responsive design — mobile & desktop friendly",
      "Privacy-first, no signup required",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Split bills and tips online",
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
      { "@type": "ListItem", position: 3, name: "Tip Splitter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I split the bill unevenly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can assign custom amounts per person instead of splitting equally.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tip apply before or after tax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can choose whether to apply the tip on the pre-tax or post-tax total.",
        },
      },
      {
        "@type": "Question",
        name: "Can I round up amounts to avoid decimals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enable rounding to make per-person totals easier to pay with cash or mobile payment apps.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data saved online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All calculations run in your browser only. Nothing is uploaded or stored online.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <TipSplitterClient />
    </div>
  );
}
