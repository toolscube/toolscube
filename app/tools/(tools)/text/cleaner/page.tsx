import JsonLd from "@/components/seo/json-ld";
import TextCleanerClient from "@/components/tools/text/text-cleaner-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Text Cleaner • Tools Hub",
  description:
    "Remove extra spaces, emojis, HTML, punctuation, diacritics, URLs, and unwanted characters. Normalize whitespace, decode entities, and format text instantly.",
  path: "/tools/text/cleaner",
  keywords: [
    "text cleaner",
    "clean text online",
    "normalize text",
    "format text",
    "sanitize text",
    "remove spaces",
    "remove extra spaces",
    "trim whitespace",
    "remove newlines",
    "remove empty lines",
    "remove emojis",
    "remove punctuation",
    "remove diacritics",
    "strip HTML",
    "decode HTML entities",
    "strip URLs",
    "strip emails",
    "ascii only",
    "lowercase uppercase",
    "sentence case",
    "title case",
    "unicode normalize",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/cleaner`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Text Cleaner — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online text cleaner to remove spaces, emojis, HTML, punctuation, diacritics, URLs, and emails. Normalize whitespace, decode HTML entities, and convert case.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Remove extra spaces & normalize whitespace",
      "Trim lines, collapse multiple newlines, remove empty lines",
      "Strip HTML tags and decode HTML entities",
      "Remove emojis, punctuation, URLs, and email addresses",
      "Remove diacritics (normalize to ASCII)",
      "Unicode normalization (NFC/NFD/NFKC/NFKD) — if supported",
      "Case tools: lowercase, UPPERCASE, Sentence, Title",
      "Copy to clipboard & download cleaned text",
      "Privacy-first: runs in your browser",
      "Fast, mobile-friendly UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "Action",
      target: toolUrl,
      name: "Clean text online",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-text` },
      { "@type": "ListItem", position: 3, name: "Text Cleaner", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What can this Text Cleaner remove?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It removes extra spaces, newlines, empty lines, emojis, punctuation, HTML tags, URLs, and emails. It can also decode HTML entities and strip diacritics.",
        },
      },
      {
        "@type": "Question",
        name: "Does it run locally in my browser?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool is privacy-friendly and processes your text in the browser without uploading it to a server.",
        },
      },
      {
        "@type": "Question",
        name: "Can I also change the text case?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can quickly convert to lowercase, UPPERCASE, Sentence case, and Title Case as part of the cleanup pipeline.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <TextCleanerClient />
    </div>
  );
}
