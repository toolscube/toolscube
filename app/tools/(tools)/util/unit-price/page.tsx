import JsonLd from "@/components/seo/json-ld";
import UnitPriceClient from "@/components/tools/util/unit-price-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Unit Price Compare • Tools Hub",
  description:
    "Quickly compare unit prices to find which product size is cheaper. Enter price, quantity, and unit to get instant comparisons with discounts and taxes.",
  path: "/tools/util/unit-price",
  keywords: [
    "unit price calculator",
    "price per kg",
    "price per liter",
    "price per unit",
    "compare product prices",
    "cheaper product size",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Unit Price Compare — Tools Hub",
    url: `${site}/tools/util/unit-price`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Easily compare product unit prices (per gram, per liter, per piece, etc.) to see which size offers better value. Handles discounts and taxes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Compare prices per gram, kg, ml, L, or unit",
      "See which product size is cheaper",
      "Supports discounts and taxes",
      "Custom unit ratios supported",
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
      <UnitPriceClient />
    </div>
  );
}
