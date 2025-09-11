import JsonLd from "@/components/seo/json-ld";
import ImageConvertClient from "@/components/tools/image/image-convert-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Image Convert • Tools Hub",
  description:
    "Convert images between JPG, PNG, WebP, and AVIF instantly. High quality, batch mode, resize & compress, no watermark — private and fast.",
  path: "/tools/image/convert",
  keywords: [
    "image converter",
    "convert image online",
    "online photo converter",
    "free image convert",
    "no watermark image converter",
    "JPG to PNG",
    "PNG to JPG",
    "JPG to WebP",
    "WebP to JPG",
    "PNG to WebP",
    "AVIF to JPG",
    "AVIF to PNG",
    "HEIC to JPG",
    "batch image convert",
    "lossless image conversion",
    "image compression",
    "optimize image",
    "resize image online",
    "adjust image quality",
    "download zip images",
    "drag and drop images",
    "client-side image convert",
    "secure image converter",
    "offline capable image tool",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/image/convert`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Convert — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online image converter for JPG, PNG, WebP, and AVIF. Maintain quality, resize, compress, batch convert, and export instantly without watermark.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert JPG, PNG, WebP, and AVIF in seconds",
      "Drag & drop image upload",
      "Batch conversion support",
      "High-quality output (lossless option)",
      "Resize and compress images",
      "Adjust quality before download",
      "Download as ZIP for multiple files",
      "Secure conversion — no data stored",
      "Works in all browsers, no installation",
      "Completely free with no watermark",
      "Fast processing with offline-capable support",
      "Supports large files (up to 50MB+)",
      "Mobile-friendly and responsive design",
      "History of recent conversions",
      "One-click copy & share link",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Convert an image",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Image", item: `${siteURL}/tools#cat-image` },
      { "@type": "ListItem", position: 3, name: "Image Convert", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JPG, PNG, WebP, and AVIF are supported for both input and output. Some browsers may also allow HEIC/HEIF input via native decoders.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a watermark or file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No watermark. Typical limit is around 50MB per file (browser-dependent). Batch mode lets you export multiple files as a ZIP.",
        },
      },
      {
        "@type": "Question",
        name: "Is my image uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Conversions run locally in your browser for a privacy-friendly workflow. Nothing is uploaded or stored on our servers.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <ImageConvertClient />
    </div>
  );
}
