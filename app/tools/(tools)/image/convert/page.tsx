import JsonLd from "@/components/seo/json-ld";
import ImageConvertClient from "@/components/tools/image/image-convert-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Image Convert • Tools Hub",
  description:
    "Convert images between JPG, PNG, WebP, and AVIF formats instantly. High quality, secure, drag & drop, free to use — powered by Tools Hub.",
  path: "/tools/image/convert",
  keywords: [
    "image converter",
    "convert image online",
    "JPG to PNG",
    "PNG to JPG",
    "JPG to WebP",
    "WebP to JPG",
    "AVIF to JPG",
    "PNG to WebP",
    "free online converter",
    "batch image convert",
    "lossless image conversion",
    "image compression",
    "optimize image",
    "online photo converter",
    "fast image convert",
    "secure image converter",
    "no watermark image converter",
    "Bangladesh",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Convert — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/image/convert`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Free online image converter for JPG, PNG, WebP, and AVIF formats. Maintain high quality, compress images, and export instantly without watermark.",
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
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <ImageConvertClient />
    </div>
  );
}
