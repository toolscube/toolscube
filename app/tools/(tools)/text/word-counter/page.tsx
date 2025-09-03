import JsonLd from "@/components/seo/json-ld";
import WordCounterClient from "@/components/tools/text/word-counter-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Word Counter • Tools Hub",
  description:
    "Count words, characters, sentences, paragraphs, and lines. Live reading/speaking time, keyword density, and quick text transforms.",
  path: "/tools/text/word-counter",
  keywords: [
    "word counter",
    "character counter",
    "count words",
    "reading time",
    "keyword density",
    "sentence counter",
    "paragraph counter",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Word Counter — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/word-counter`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Count words, characters, sentences, paragraphs, and lines. Includes reading/speaking time and keyword density.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Word & character count",
      "Sentences, lines, paragraphs",
      "Reading/speaking time",
      "Keyword density (stopwords toggle)",
      "Quick transforms (UPPERCASE, Title, slugify)",
    ],
    creator: {
      "@type": "Personal",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <WordCounterClient />
    </div>
  );
}
