import JsonLd from "@/components/seo/json-ld";
import RandomPickerClient from "@/components/tools/util/random-picker-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Random Picker • Tools Hub",
  description:
    "Pick a random winner from a list of names. Perfect for giveaways, raffles, classroom activities, and more. Fast, fair, and free.",
  path: "/tools/util/random-picker",
  keywords: [
    "random picker",
    "pick winner",
    "raffle tool",
    "giveaway tool",
    "random name selector",
    "online picker",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Random Picker — Tools Hub",
    url: `${site}/tools/util/random-picker`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Enter a list of names and pick a random winner instantly. Ideal for raffles, giveaways, team selection, and classroom activities.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Paste or type names",
      "One-click random selection",
      "Highlight the winner",
      "No ads, free forever",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />

      {/* Interactive client component */}
      <RandomPickerClient />
    </div>
  );
}
