import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import AuthSessionProvider from "@/components/providers/session-provider";
import ToasterProvider from "@/components/providers/toaster-provider";
import JsonLd from "@/components/seo/json-ld";
import { ToolsData } from "@/data/tools";
import { siteURL } from "@/lib/constants";
import { structuredData } from "@/lib/seo-config";
import { buildDynamicKeywords, mergeKeywords, siteDescriptionFallback } from "@/lib/seo-tools";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

const STATIC_KEYWORDS = [
  "online tools",
  "url shortener",
  "pdf tools",
  "image converter",
  "text utilities",
  "developer tools",
  "calculators",
  "free tools",
  "privacy friendly",
  "seo tools",
  "unit converter",
  "hash generator",
  "regex tester",
  "json formatter",
];

const DYNAMIC_KEYWORDS = buildDynamicKeywords(ToolsData);
const KEYWORDS = mergeKeywords(STATIC_KEYWORDS, DYNAMIC_KEYWORDS);

const description =
  "URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators — all in one place.";
const smartDescription = description || siteDescriptionFallback(ToolsData);

export const metadata: Metadata = {
  title: {
    default: "Tools Cube — Fast, Free, Privacy-Friendly Online Tools",
    template: "%s - Tools Cube",
  },
  description: smartDescription,
  metadataBase: new URL(siteURL),
  keywords: KEYWORDS,
  authors: [{ name: "Tariqul Islam", url: "https://tariqul.dev" }],
  creator: "Tariqul Islam",
  publisher: "Tariqul Islam",
  category: "UtilitiesApplication",
  applicationName: "Tools Cube",
  appLinks: {
    web: {
      url: `${siteURL}`,
    },
  },
  openGraph: {
    title: "Tools Cube — Fast, Free, Privacy-Friendly Online Tools",
    description:
      "Fast, free, privacy-friendly online tools. Shorten links, convert files, optimize images, and more.",
    type: "website",
    url: `${siteURL}/tools`,
    siteName: "Tools Cube",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    images: [
      {
        url: `${siteURL}/assets/tools-cube.jpg`,
        width: 1200,
        height: 630,
        alt: "Tools Cube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@toolscube",
    creator: "@toolscube",
    title: "Tools Cube — Fast, Free, Privacy-Friendly Online Tools",
    description:
      "Shorten links, convert files, optimize images, and more. 100% free and privacy-first.",
    images: [`${siteURL}/assets/tools-cube.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${siteURL}/tools`,
    languages: {
      "en-US": `${siteURL}/tools`,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tools Cube",
    url: siteURL,
    inLanguage: ["en", "bn"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteURL}/search?q={query}`,
      "query-input": "required name=query",
    },
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tools Cube",
    url: siteURL,
    logo: `${siteURL}/assets/logo.png`,
    sameAs: [
      "https://tariqul.dev",
      "https://github.com/tariqul420",
      "https://linkedin.com/tariqul-dev",
      "https://facebook.com/tariqul2984",
    ],
  };

  const navLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tools Cube Categories",
    itemListElement: ToolsData.map((c, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${siteURL}${c.url}`,
    })),
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <JsonLd data={siteLd} />
        <JsonLd data={orgLd} />
        <JsonLd data={navLd} />
        <JsonLd data={structuredData.website} />
        <JsonLd data={structuredData.organization} />
        <JsonLd data={structuredData.webApplication} />
        <AuthSessionProvider>
          <main>{children}</main>
        </AuthSessionProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
