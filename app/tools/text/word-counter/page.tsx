import JsonLd from "@/components/seo/json-ld";
import WordCounterClient from "@/components/tools/text/word-counter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Word Counter",
  description:
    "Count words, characters, sentences, paragraphs, and lines. Estimate reading/speaking time, analyze keyword density, and apply quick text transforms—free and privacy-friendly.",
  path: "/tools/text/word-counter",
  keywords: [
    "word counter",
    "character counter",
    "count words",
    "count characters",
    "sentence counter",
    "paragraph counter",
    "line counter",
    "reading time calculator",
    "speaking time estimator",
    "keyword density analyzer",
    "unique words count",
    "stopwords toggle",
    "quick text transforms",
    "uppercase lowercase title case",
    "slugify text",
    "copy and export text stats",
    "Tools Cube",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/word-counter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Word Counter — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Count words, characters, sentences, paragraphs, and lines. Get reading/speaking time and keyword density with stopwords control. Runs locally in your browser.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Word & character counts (with/without spaces)",
      "Sentences, lines, and paragraphs",
      "Estimated reading and speaking time",
      "Keyword density with stopwords toggle",
      "Unique words and top keywords summary",
      "Quick transforms: UPPERCASE, lowercase, Title Case, slugify",
      "Copy stats and export results (CSV/TXT)",
      "Privacy-first: all processing in your browser",
      "Fast, mobile-friendly UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "AssessAction",
      target: toolUrl,
      name: "Analyze text word and character counts",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-text` },
      { "@type": "ListItem", position: 3, name: "Word Counter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you count characters with and without spaces?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool shows both counts so you can meet specific platform limits and formatting requirements.",
        },
      },
      {
        "@type": "Question",
        name: "How is reading and speaking time estimated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reading time is based on an average of ~200–250 words per minute, while speaking time uses ~120–160 words per minute. You can adjust presets in the UI if supported.",
        },
      },
      {
        "@type": "Question",
        name: "Is my text uploaded or stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All analysis runs locally in your browser. We do not upload, log, or store your content.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />
      <WordCounterClient />
    </div>
  );
}
