import JsonLd from "@/components/seo/json-ld";
import SchemaGeneratorClient from "@/components/tools/seo/schema-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Schema Markup Generator",
  description:
    "Create valid JSON-LD structured data for Article, Product, Organization, LocalBusiness, Breadcrumb, FAQ, HowTo, Event, and more — with live validation hints and copy-ready snippets.",
  path: "/tools/seo/schema-generator",
  keywords: [
    "schema markup generator",
    "JSON-LD generator",
    "structured data generator",
    "rich results schema",
    "schema.org generator",
    "Article schema",
    "Product schema",
    "Organization schema",
    "LocalBusiness schema",
    "FAQ schema",
    "HowTo schema",
    "Breadcrumb schema",
    "Event schema",
    "Person schema",
    "WebSite + SearchAction schema",
    "Review & AggregateRating schema",
    "JSON-LD validator",
    "schema preview",
    "copy schema",
    "import/export JSON",
    "multiple languages",
    "SEO tools",
    "Tools Cube",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/seo/schema-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Schema Markup Generator — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Generate valid JSON-LD for Article, Product, Organization, LocalBusiness, Breadcrumb, FAQ, HowTo, Event, and more. Includes live hints and copy-ready snippets.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Point-and-click fields for multiple schema.org types",
      "Popular presets: Article, Product, Organization, LocalBusiness",
      "Content types: FAQPage, HowTo, BreadcrumbList, Event, Person, WebSite",
      "Add images, URLs, dates, price, availability, ratings, geo & openingHours (where applicable)",
      "Live validation hints and required/optional field guidance",
      "Combine multiple entities in one JSON-LD graph",
      'Copy single block or full <script type="application/ld+json"> snippet',
      "Import/export project as JSON; version history (local)",
      "Supports multiple languages (inLanguage) and @id links",
      "Dark mode, responsive, privacy-first, offline capable",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate JSON-LD schema markup",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Output", value: "JSON-LD (schema.org)" },
      {
        "@type": "PropertyValue",
        name: "Validation",
        value: "Inline hints; copy to Rich Results Test",
      },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "SEO", item: `${siteURL}/tools#cat-seo` },
      { "@type": "ListItem", position: 3, name: "Schema Markup Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which schema types are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool covers Article, Product, Organization, LocalBusiness, FAQPage, HowTo, BreadcrumbList, Event, Person, WebSite (with SearchAction), Review, and more via presets.",
        },
      },
      {
        "@type": "Question",
        name: "Does this guarantee Google rich results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No tool can guarantee eligibility. Proper implementation and Google’s policies determine whether rich results are shown.",
        },
      },
      {
        "@type": "Question",
        name: "Can I combine multiple entities in one JSON-LD?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can output a single @graph containing multiple entities linked with @id for clean, scalable markup.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs locally in your browser. You can export and re-import your setup as JSON when needed.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <SchemaGeneratorClient />
    </div>
  );
}
