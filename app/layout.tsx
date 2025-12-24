import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import "./globals.css";

import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/analytics/google-tag-manager";
import AuthSessionProvider from "@/components/providers/session-provider";
import ToasterProvider from "@/components/providers/toaster-provider";
import JsonLd from "@/components/seo/json-ld";
import { ToolsData } from "@/data/tools";
import { siteURL } from "@/lib/constants";
import { structuredData } from "@/lib/seo-config";
import {
  buildDynamicKeywords,
  mergeKeywords,
  siteDescriptionFallback,
} from "@/lib/seo-tools";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

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
  "Free online tools for developers and professionals: URL shortener, QR code generator, JSON formatter, image converter, Base64 encoder, hash generator, regex tester, calculators, and 70+ utilities. No signup required, privacy-first.";
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
    title: "Tools Cube — 70+ Free Online Tools for Developers & Professionals",
    description:
      "Free online tools: URL shortener, QR codes, JSON formatter, image converter, calculators, and 70+ utilities. No signup required, privacy-first, open source.",
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
    title: "Tools Cube — 70+ Free Online Tools",
    description:
      "URL shortener, QR codes, JSON formatter, image converter, calculators, and more. 100% free, no signup required, privacy-first.",
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
    languages: {
      "en-US": `${siteURL}`,
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
      <head>
        <GoogleTagManager />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <GoogleTagManagerNoScript />
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
