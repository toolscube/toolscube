import JsonLd from "@/components/seo/json-ld";
import PackingChecklistClient from "@/components/tools/travel/packing-checklist-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Packing Checklist",
  description:
    "Generate a smart packing checklist in seconds. Pick a template (business, beach, camping, family), tweak items & quantities, and export or print.",
  path: "/tools/travel/packing",
  keywords: [
    "packing checklist",
    "travel packing list",
    "trip checklist",
    "vacation packing list",
    "luggage checklist",
    "carry-on checklist",
    "smart packing list",
    "business trip packing",
    "beach holiday packing",
    "camping packing list",
    "city break packing",
    "backpacking checklist",
    "festival packing",
    "road trip packing",
    "family packing list",
    "baby packing checklist",
    "international travel checklist",
    "clothing checklist",
    "toiletries list",
    "electronics checklist",
    "documents passport visa",
    "first aid kit list",
    "medications checklist",
    "weather packing",
    "packing list generator",
    "packing list templates",
    "quantities and weights",
    "share and print packing list",
    "export CSV PDF",
    "offline packing tool",
    "Tools Cube",
    "travel tools",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/travel/packing`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Packing Checklist — Tools Cube",
    url: toolUrl,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Create a smart, templated packing checklist for any trip. Choose a template, customize items and quantities, and export or print.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Starter templates: Business, Beach, Camping, City Break, Backpacking, Festival, Family/Baby",
      "Auto-grouped categories: Clothing, Toiletries, Electronics, Documents, Health, Misc",
      "Customize items, notes, and quantities; add your own categories",
      "Tick-off progress with live completion stats",
      "Optional weight per item with total weight estimate",
      "Weather & duration hints (e.g., rain gear, layers) — if enabled",
      "Multi-traveler support (assign items per person) — if enabled",
      "Save/load presets locally; duplicate lists for new trips",
      "Export to CSV/JSON; Print/Save as PDF; share link",
      "Offline-capable and privacy-friendly (runs in your browser)",
      "Mobile-friendly UI with drag & drop reordering",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate a packing checklist",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Travel", item: `${siteURL}/tools#cat-travel` },
      { "@type": "ListItem", position: 3, name: "Packing Checklist", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I customize the packing templates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Start from any template and freely add, edit, or remove items and categories. You can also save your custom list as a preset.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support quantities and total weight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can set quantities per item and optionally add weights to estimate total luggage weight.",
        },
      },
      {
        "@type": "Question",
        name: "Will my packing list be saved online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool runs locally in your browser. Lists are saved to local storage and never uploaded unless you choose to export or share.",
        },
      },
      {
        "@type": "Question",
        name: "Can I print or export my list?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can print or save as PDF, and export to CSV or JSON for backups or sharing.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <PackingChecklistClient />
    </div>
  );
}
