import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { ToolsData } from "@/data/tools";
import { siteURL } from "@/lib/constants";
import { buildDynamicKeywords, mergeKeywords, siteDescriptionFallback } from "@/lib/seo-tools";

const STATIC_KEYWORDS = [
  "online tools",
  "url shortener",
  "pdf tools",
  "image tools",
  "text utilities",
  "developer tools",
  "seo tools",
  "calculators",
  "free tools",
  "privacy friendly",
];

const DYNAMIC_KEYWORDS = buildDynamicKeywords(ToolsData);
const KEYWORDS = mergeKeywords(STATIC_KEYWORDS, DYNAMIC_KEYWORDS);

const description =
  "Browse all online utilities: URL shortener, PDF & image tools, text utilities, developer helpers, SEO tools, and calculators.";
const smartDescription = description || siteDescriptionFallback(ToolsData);

export const metadata: Metadata = {
  title: {
    default: "Tools — Tools Hub",
    template: "%s • Tools Hub",
  },
  description: smartDescription,
  keywords: KEYWORDS,
  openGraph: {
    title: "Tools — Tools Hub",
    description: smartDescription,
    url: `${siteURL}/tools`,
    type: "website",
    siteName: "Tools Hub",
    images: [
      {
        url: `${siteURL}/og/tools-hub-og.png`,
        width: 1200,
        height: 630,
        alt: "Tools Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@toolshub",
    creator: "@toolshub",
    title: "Tools — Tools Hub",
    description: smartDescription,
    images: [`${siteURL}/og/tools-hub-og.png`],
  },
  alternates: {
    canonical: `${siteURL}/tools`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const navLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tools Hub Categories",
    itemListElement: ToolsData.map((c, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${siteURL}${c.url}`,
    })),
  };

  return (
    <main className="scroll-smooth">
      <JsonLd data={navLd} />
      {children}
    </main>
  );
}
