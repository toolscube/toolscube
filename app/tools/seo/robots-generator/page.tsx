// app/tools/seo/robots-generator/page.tsx
import JsonLd from "@/components/seo/json-ld";
import RobotsGeneratorClient from "@/components/tools/seo/robots-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "robots.txt Generator",
  description:
    "Generate SEO-friendly robots.txt files to control search engine crawling and indexing. Add rules for Google, Bing, Yahoo, and custom bots. Supports sitemap and user-agent targeting.",
  path: "/tools/seo/robots-generator",
  keywords: [
    "robots.txt generator",
    "robots.txt creator",
    "robots.txt online tool",
    "generate robots file",
    "SEO robots.txt",
    "block search engines",
    "disallow pages",
    "allow pages",
    "sitemap robots.txt",
    "crawl delay robots.txt",
    "user agent rules",
    "googlebot rules",
    "bingbot rules",
    "seo optimization robots",
    "robots.txt validator",
    "SEO tools",
    "control indexing",
    "block private pages",
    "allow public pages",
    "manage search bots",
    "Tools Cube",
    "SEO optimization",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/seo/robots-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "robots.txt Generator — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Create robots.txt files with custom allow/disallow rules, user-agent targeting, crawl-delay, and sitemap references. Improve SEO and control crawler access with one click.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Add allow/disallow rules easily",
      "Target specific user-agents (Googlebot, Bingbot, etc.)",
      "Crawl-delay configuration",
      "Add sitemap URLs for better SEO",
      "Generate robots.txt instantly",
      "Copy to clipboard or export as .txt",
      "Validate rules before saving",
      "Preview robots.txt structure",
      "Autosave locally (privacy-friendly)",
      "No signup, free forever",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate robots.txt file",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "SEO", item: `${siteURL}/tools#cat-seo` },
      { "@type": "ListItem", position: 3, name: "robots.txt Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a robots.txt file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A robots.txt file tells search engine crawlers which pages or files they can or cannot request from your site. It helps control indexing and optimize SEO.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a sitemap in robots.txt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It’s highly recommended to include your sitemap in robots.txt. This helps search engines discover and crawl your pages efficiently.",
        },
      },
      {
        "@type": "Question",
        name: "Can I block specific bots with robots.txt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can target specific user-agents such as Googlebot, Bingbot, or others and allow/disallow them accordingly.",
        },
      },
      {
        "@type": "Question",
        name: "Is robots.txt mandatory for SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. It’s optional, but strongly recommended for managing crawl budget, blocking private areas, and improving SEO structure.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <RobotsGeneratorClient />
    </div>
  );
}
