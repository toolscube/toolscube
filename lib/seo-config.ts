import type { Metadata } from "next";
import { siteURL } from "./constants";

export const siteConfig = {
  name: "Tools Cube",
  description:
    "70+ free online tools for developers and professionals. URL shortener, QR code generator, JSON formatter, image converter, calculators, and more. No signup required, privacy-first.",
  url: siteURL,
  ogImage: `${siteURL}/og/tools-cube-og.png`,
  twitter: "@toolscube",
  keywords: [
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
    "file converter",
    "qr code generator",
    "base64 encoder",
    "password generator",
    "color picker",
    "markdown editor",
    "css minifier",
    "html formatter",
    "tools cube",
    "web utilities",
    "productivity tools",
  ],
};

export function generateSEOMetadata({
  title,
  description,
  image,
  path,
  noIndex = false
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const pageTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const pageImage = image || siteConfig.ogImage;
  const pageUrl = path ? `${siteConfig.url}${path}` : siteConfig.url;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords.join(", "),
    authors: [{ name: "Tariqul Islam", url: "https://tariqul.dev" }],
    creator: "Tariqul Islam",
    publisher: "Tools Cube",
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
    alternates: {
      canonical: pageUrl,
    },
    metadataBase: new URL(siteConfig.url),
  };
}

export const structuredData = {
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/assets/logo.png`,
    description: siteConfig.description,
    foundingDate: "2025",
    sameAs: [
      "https://tariqul.dev",
      "https://github.com/tariqul420",
      "https://linkedin.com/in/tariqul-dev",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Bengali"],
    },
  },

  webApplication: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    permissions: "browserPermissions",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    screenshot: siteConfig.ogImage,
    softwareVersion: "1.0",
    releaseNotes: "Free online tools for productivity and development",
    featureList: [
      "URL Shortener",
      "PDF Tools",
      "Image Converter",
      "Text Utilities",
      "Developer Tools",
      "Calculators",
      "SEO Tools",
    ],
  },
};