import JsonLd from "@/components/seo/json-ld";
import RegexLibraryClient from "@/components/tools/dev/regex-library-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Regex Library",
  description:
    "Explore a collection of useful regular expressions for validation, search, and replace. Copy-ready regex patterns for emails, URLs, numbers, dates, HTML, and more.",
  path: "/tools/dev/regex-library",
  keywords: [
    "regex library",
    "regular expressions",
    "regex patterns",
    "regex examples",
    "regex collection",
    "regex cheatsheet",
    "email regex",
    "URL regex",
    "phone regex",
    "date regex",
    "time regex",
    "credit card regex",
    "IP address regex",
    "username regex",
    "password regex",
    "regex search",
    "regex replace",
    "regex online",
    "regex snippets",
    "regex for developers",
    "regex testing",
    "developer tools",
    "Tools Cube",
    "Bangladesh",
    "online tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/regex-library`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Regex Library — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "A curated library of regular expressions for developers. Validate inputs like emails, URLs, dates, and more. Copy-ready regex patterns with explanations.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Pre-built regex patterns for common use cases",
      "Validation regex: email, phone, date, time, IP, credit card",
      "Text extraction regex: hashtags, mentions, HTML tags",
      "Search/replace ready snippets",
      "Copy regex with one click",
      "Regex explanations and usage notes",
      "Compatible with JavaScript, Python, PHP, etc.",
      "Organized categories for quick lookup",
      "Mobile-friendly UI with dark/light mode",
      "Privacy-first: runs entirely in browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${toolUrl}?q={pattern}`,
      "query-input": "required name=pattern",
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
        name: "Developer",
        item: `${siteURL}/tools#cat-developer`,
      },
      { "@type": "ListItem", position: 3, name: "Regex Library", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What kind of regex patterns are included?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The library includes regex for validation (email, phone, URLs, dates, IPs, credit cards), extraction (hashtags, mentions, HTML tags), and common developer use cases.",
        },
      },
      {
        "@type": "Question",
        name: "Are these regex patterns language-specific?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most regex patterns are compatible with multiple languages like JavaScript, Python, PHP, and Java. Some may need slight syntax adjustments.",
        },
      },
      {
        "@type": "Question",
        name: "Can I copy regex directly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Each regex comes with a one-click copy button, so you can paste it directly into your project.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <RegexLibraryClient />
    </div>
  );
}
