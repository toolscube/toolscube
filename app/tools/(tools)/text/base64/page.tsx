import JsonLd from "@/components/seo/json-ld";
import Base64Client from "@/components/tools/text/base64-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Base64 Encode/Decode",
  description:
    "Encode text, images, or files to Base64 and decode Base64 back to the original. Free, fast, privacy-friendly Base64 converter with copy & download.",
  path: "/tools/text/base64",
  keywords: [
    "Base64 encode",
    "Base64 decode",
    "Base64 converter",
    "encode online",
    "decode online",
    "text to Base64",
    "file to Base64",
    "image to Base64",
    "Base64 to text",
    "Base64 to file",
    "Base64 to image",
    "data URI",
    "data URL",
    "Base64 data URL",
    "binary to Base64",
    "utf-8 Base64",
    "Base64 validator",
    "mime type detector",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/base64`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Base64 Encode/Decode — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Convert text, images, and files to Base64, or decode Base64 back to its original format. Supports data URLs, preview, copy, and download.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Text ⇄ Base64 conversion",
      "File ⇄ Base64 conversion (auto MIME detection)",
      "Image preview for Base64 data URLs",
      "Generate data URLs (data:image/png;base64,...)",
      "Validate & detect invalid Base64",
      "Copy to clipboard & download output",
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
      name: "Convert Base64",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-text` },
      { "@type": "ListItem", position: 3, name: "Base64 Encode/Decode", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Base64 used for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Base64 encodes binary data into ASCII text, commonly used in data URLs, email MIME, and safely transporting binary through text-based protocols.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert images and files to Base64?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload any supported file to convert it to Base64. For images, a preview and data URL are also provided.",
        },
      },
      {
        "@type": "Question",
        name: "Is this tool privacy-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Conversions run locally in your browser, so your content is not uploaded to a server.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <Base64Client />
    </div>
  );
}
