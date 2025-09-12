import JsonLd from "@/components/seo/json-ld";
import SitemapGeneratorClient from "@/components/tools/seo/sitemap-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sitemap.xml Generator",
  description:
    "Generate SEO-friendly XML sitemaps from URL lists. Add priority, changefreq, lastmod, and export valid sitemap.xml for Google, Bing, and other search engines.",
  path: "/tools/seo/sitemap-generator",
  keywords: [
    "sitemap generator",
    "XML sitemap generator",
    "sitemap.xml builder",
    "SEO sitemap tool",
    "create sitemap online",
    "priority and changefreq",
    "lastmod date",
    "URL list to sitemap",
    "validate sitemap",
    "submit sitemap",
    "sitemap export",
    "Google sitemap",
    "Bing sitemap",
    "Yahoo sitemap",
    "Yandex sitemap",
    "dynamic sitemap generator",
    "custom sitemap builder",
    "SEO indexing tool",
    "large site sitemap",
    "multi-language sitemap",
    "SEO tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/seo/sitemap-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sitemap.xml Generator — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Quickly generate valid XML sitemaps from a list of URLs. Supports lastmod, changefreq, priority, and exporting sitemap.xml for Google and Bing Search Console.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Paste or upload list of URLs",
      "Set <lastmod>, <changefreq>, and <priority> for each URL",
      "Generate clean sitemap.xml instantly",
      "Validate XML format before export",
      "Support for large sites with thousands of URLs",
      "Download as XML, TXT, or JSON",
      "Option to split into multiple sitemap files",
      "Autosave project to local storage",
      "Mobile-friendly, offline-capable UI",
      "Privacy-first: data processed in browser only",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate sitemap.xml online",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "SEO", item: `${siteURL}/tools#cat-seo` },
      { "@type": "ListItem", position: 3, name: "Sitemap.xml Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a sitemap.xml file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A sitemap.xml file lists the important URLs of your site to help search engines like Google and Bing crawl and index your content efficiently.",
        },
      },
      {
        "@type": "Question",
        name: "How often should I update my sitemap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Update your sitemap whenever you add, remove, or change important pages. Many sites regenerate sitemaps daily or weekly.",
        },
      },
      {
        "@type": "Question",
        name: "What are changefreq and priority?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Changefreq tells crawlers how often a page is likely to change (daily, weekly, monthly), and priority indicates the relative importance of a URL compared to others.",
        },
      },
      {
        "@type": "Question",
        name: "Can I submit my sitemap directly to Google?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. After generating your sitemap, upload it to your website root and submit its URL (e.g., https://example.com/sitemap.xml) in Google Search Console.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <SitemapGeneratorClient />
    </div>
  );
}
