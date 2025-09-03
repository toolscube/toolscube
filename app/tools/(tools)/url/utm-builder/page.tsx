import JsonLd from "@/components/seo/json-ld";
import UTMBuilderClient from "@/components/tools/url/utm-builder-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "UTM Builder • Tools Hub",
  description:
    "Build UTM-tagged links fast. Preserve existing params, batch-generate, save presets, and export CSV.",
  path: "/tools/url/utm",
  keywords: [
    "UTM builder",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "campaign url builder",
    "link tracking",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "UTM Builder — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/url/utm`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Create campaign UTM parameters quickly, batch-generate tagged URLs, save presets, and export CSV.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Preserve existing query params",
      "Lowercase keys",
      "Batch mode",
      "Custom parameters",
      "Presets import/export",
      "CSV export",
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
      <UTMBuilderClient />
    </div>
  );
}
