import JsonLd from "@/components/seo/json-ld";
import SlugifyClient from "@/components/tools/text/slugify-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Slugify • Tools Hub",
  description:
    "Create SEO-friendly slugs from text. Live or manual mode, delimiters, transliteration, stopwords, custom replacements, and batch processing.",
  path: "/tools/text/slugify",
  keywords: [
    "slugify",
    "slug generator",
    "SEO slug",
    "URL slug",
    "text to slug",
    "kebab-case",
    "dash separated",
    "transliterate",
    "remove diacritics",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Slugify — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/slugify`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Convert titles and phrases into clean, URL-safe slugs with live/manual modes, delimiter control, stopwords, and batch processing.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Live & Manual modes",
      "Dash/underscore/concat delimiters",
      "Transliteration (diacritics removal)",
      "Stopwords filtering",
      "Custom find → replace rules",
      "Max length trimming",
      "Batch (line-by-line) slugify",
      "Copy actions",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      {/* JSON-LD */}
      <JsonLd data={jsonLd} />

      {/* Interactive client component */}
      <SlugifyClient />
    </div>
  );
}
