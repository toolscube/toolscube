import JsonLd from "@/components/seo/json-ld";
import UTMBuilderClient from "@/components/tools/url/utm-builder-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "UTM Builder • Tools Hub",
  description:
    "Quickly build campaign tracking links with UTM parameters. Batch-generate tagged URLs, save presets, export CSV, and track campaigns accurately.",
  path: "/tools/url/utm-builder",
  keywords: [
    "UTM builder",
    "UTM generator",
    "UTM link builder",
    "campaign URL builder",
    "UTM parameters",
    "Google Analytics UTM",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "batch UTM generator",
    "custom UTM presets",
    "save UTM presets",
    "CSV export UTM",
    "import UTM",
    "campaign tracking links",
    "marketing URL builder",
    "link tracking",
    "analytics tags",
    "privacy friendly UTM builder",
    "Tools Hub",
    "Bangladesh",
    "online tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/url/utm-builder`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "UTM Builder — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Generate UTM-tagged links quickly with full control. Supports batch generation, saving presets, CSV export, and preserving existing parameters.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Add utm_source, utm_medium, utm_campaign, utm_term, utm_content",
      "Preserve existing query parameters",
      "Force lowercase UTM keys for consistency",
      "Batch mode: generate multiple tagged URLs at once",
      "Define and save custom parameter presets",
      "Export/import presets for reuse",
      "CSV export for bulk campaign tracking",
      "Privacy-first: all generation runs in your browser",
      "Copy/share tagged links instantly",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Build a UTM link",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools/url` },
      { "@type": "ListItem", position: 3, name: "UTM Builder", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a UTM Builder?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A UTM Builder helps marketers create URLs with UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) for campaign tracking in analytics platforms like Google Analytics.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate multiple UTM links at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Batch mode lets you generate multiple UTM-tagged links at the same time, which is ideal for larger campaigns.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save presets for future campaigns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can create presets with predefined UTM parameters, save them for reuse, and export/import them across devices.",
        },
      },
      {
        "@type": "Question",
        name: "Is it privacy-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All link generation happens directly in your browser — no data is sent to our servers.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />
      <UTMBuilderClient />
    </div>
  );
}
