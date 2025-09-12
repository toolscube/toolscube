import JsonLd from "@/components/seo/json-ld";
import MetaGeneratorClient from "@/components/tools/seo/meta-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Meta Tags Generator",
  description:
    "Generate SEO-friendly meta tags for HTML head: title, description, Open Graph, Twitter Cards, canonical, robots, and more — with live preview.",
  path: "/tools/seo/meta-generator",
  keywords: [
    "meta tags generator",
    "SEO meta generator",
    "HTML head generator",
    "meta title description",
    "Open Graph tags",
    "Twitter card tags",
    "canonical URL",
    "robots meta",
    "favicon meta",
    "theme color meta",
    "viewport meta",
    "og:image generator",
    "social preview tags",
    "meta tags preview",
    "SEO head builder",
    "SEO tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/seo/meta-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Meta Tags Generator — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Create SEO & social meta tags with live preview. Supports title, description, canonical, robots, Open Graph, Twitter cards, favicons, and theme-color.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Live preview for SEO & social (OG/Twitter)",
      "Title & meta description length meters",
      "Canonical URL and robots meta (index/follow/noindex/nofollow)",
      "Open Graph: og:title, og:description, og:image, og:url, og:type",
      "Twitter Cards: summary / summary_large_image, site & creator",
      "Favicon & apple-touch-icon link helpers",
      "Theme-color & viewport metas",
      "Copy single tags or full <head> snippet",
      "Validate required fields and highlight issues",
      "Export / import project as JSON",
      "Responsive UI, dark mode, offline-capable",
      "Privacy-first: runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate SEO & social meta tags",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Outputs", value: "HTML head snippet" },
      { "@type": "PropertyValue", name: "Includes", value: "OG & Twitter Cards" },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "SEO", item: `${siteURL}/tools#cat-seo` },
      { "@type": "ListItem", position: 3, name: "Meta Tags Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which meta tags are essential for SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "At minimum: a unique <title>, a concise meta description, and a canonical URL. For social sharing, add Open Graph and Twitter Card tags.",
        },
      },
      {
        "@type": "Question",
        name: "What size should my og:image be?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common guidance is 1200×630 (≈1.91:1) for Facebook/LinkedIn and 1200×628 for X (Twitter) large summary. Keep file size reasonable and publicly accessible.",
        },
      },
      {
        "@type": "Question",
        name: "Should I use robots meta tags or robots.txt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use robots meta for page-level indexing directives (index, follow, noindex, nofollow). Use robots.txt to control crawling at the path/bot level.",
        },
      },
      {
        "@type": "Question",
        name: "Can I copy a full <head> snippet?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can copy individual tags or export a complete HTML head snippet that includes your selected metas and links.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <MetaGeneratorClient />
    </div>
  );
}
