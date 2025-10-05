import JsonLd from "@/components/seo/json-ld";
import RandomPickerClient from "@/components/tools/util/random-picker-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Random Picker",
  description:
    "Pick random winners fairly from a list of names or entries. Ideal for giveaways, raffles, classrooms, teams, and events. Free, fast, and privacy-friendly.",
  path: "/tools/util/random-picker",
  keywords: [
    "random picker",
    "pick winner",
    "random name picker",
    "raffle picker",
    "giveaway tool",
    "online randomizer",
    "random choice generator",
    "name selector",
    "lottery picker",
    "random draw tool",
    "spin wheel picker",
    "shuffle names",
    "multiple winners picker",
    "team selector",
    "classroom random picker",
    "student name picker",
    "raffle draw app",
    "contest winner picker",
    "wheel of names alternative",
    "Tools Cube",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/util/random-picker`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Random Picker — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Enter names or items and pick random winners fairly. Great for giveaways, raffles, team selection, and classroom activities.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Paste or type a list of names/items",
      "One-click random selection of winners",
      "Pick multiple winners at once",
      "Spin wheel or instant random draw modes",
      "Highlight winners visually with animations",
      "Shuffle entries before selection",
      "No duplicate winners (optional toggle)",
      "Save and load entry lists (local storage)",
      "Export/import lists via CSV or JSON",
      "Mobile-friendly and offline-capable",
      "Completely free, no signup, no ads",
      "Privacy-first: runs entirely in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ChooseAction",
      target: toolUrl,
      name: "Pick a random winner",
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
      { "@type": "ListItem", position: 3, name: "Random Picker", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is the random picker fair?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool uses a secure randomization method to ensure fairness. Results are generated locally in your browser without manipulation.",
        },
      },
      {
        "@type": "Question",
        name: "Can I pick multiple winners at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can choose to select more than one winner in a single draw and prevent duplicates if desired.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support a spin wheel mode?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. In addition to instant selection, you can use a spin wheel animation to pick a winner in a fun way.",
        },
      },
      {
        "@type": "Question",
        name: "Is my list of names stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All entries remain in your browser. You can save them locally or export to CSV/JSON if needed.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <RandomPickerClient />
    </div>
  );
}
