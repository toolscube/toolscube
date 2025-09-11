import JsonLd from "@/components/seo/json-ld";
import QRClient from "@/components/tools/url/qr-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "QR Code • Tools Hub",
  description:
    "Create QR codes from text and links in seconds. Support for Wi-Fi, vCard, Email, SMS, and WhatsApp. Customize colors, error correction, add a center logo, and export as PNG or SVG.",
  path: "/tools/url/qr",
  keywords: [
    "QR code",
    "QR generator",
    "QR code maker",
    "QR code generator",
    "create QR code online",
    "free QR code",
    "custom QR code",
    "safe QR codes",
    "URL QR code",
    "text QR code",
    "Wi-Fi QR",
    "wifi QR code",
    "vCard QR",
    "contact QR code",
    "WhatsApp QR",
    "Email QR",
    "SMS QR",
    "SVG QR",
    "PNG QR",
    "high resolution QR",
    "error correction L M Q H",
    "custom colors",
    "quiet zone",
    "center logo overlay",
    "download QR PNG",
    "download QR SVG",
    "copy data URL",
    "Tools Hub",
    "Bangladesh",
    "online tools",
    "privacy friendly tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/url/qr`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "QR Code — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Generate QR codes for URLs, text, Wi-Fi, vCard, Email, SMS, and WhatsApp. Customize colors, set error correction, add a center logo, and export as PNG or SVG.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Create QR for URL, Text, Wi-Fi, vCard, Email, SMS, WhatsApp",
      "Error correction levels: L, M, Q, H",
      "Custom foreground/background colors",
      "Adjustable quiet zone (padding)",
      "Center logo overlay",
      "High-resolution PNG & SVG export",
      "Copy PNG data URL to clipboard",
      "Privacy-first: runs in your browser",
      "Mobile-friendly UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate a QR code",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools/url` },
      { "@type": "ListItem", position: 3, name: "QR Code", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which QR types are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can generate QR codes for URL, Text, Wi-Fi, vCard, Email, SMS, and WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize colors and add a logo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can set foreground/background colors, adjust the quiet zone, and place a center logo overlay.",
        },
      },
      {
        "@type": "Question",
        name: "What export formats are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can download your QR as high-resolution PNG or SVG, and also copy a PNG data URL.",
        },
      },
      {
        "@type": "Question",
        name: "Is it privacy-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The generator works in your browser, so your data doesn’t leave your device during generation.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <QRClient />
    </div>
  );
}
