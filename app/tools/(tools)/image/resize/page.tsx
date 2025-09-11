import JsonLd from "@/components/seo/json-ld";
import ImageResizeClient from "@/components/tools/image/image-resize-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Image Resize • Tools Hub",
  description:
    "Resize, crop, and scale images online for free. Adjust width, height, aspect ratio, and quality — works with JPG, PNG, WebP, and AVIF.",
  path: "/tools/image/resize",
  keywords: [
    "image resizer",
    "resize image online",
    "crop image online",
    "scale image online",
    "JPG resizer",
    "PNG resizer",
    "WebP resizer",
    "AVIF resizer",
    "resize photo for social media",
    "profile picture resizer",
    "Instagram photo resize",
    "Facebook cover resize",
    "Twitter banner resize",
    "LinkedIn image resize",
    "batch image resize",
    "custom image dimensions",
    "resize without losing quality",
    "compress and resize",
    "aspect ratio image resize",
    "fast image resize tool",
    "secure online image tool",
    "no watermark image resize",
    "Bangladesh",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Resize — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/image/resize`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Free online image resizer to resize, crop, and scale images. Works with JPG, PNG, WebP, and AVIF. Maintain quality and export instantly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Resize JPG, PNG, WebP, and AVIF images instantly",
      "Crop to custom dimensions or predefined ratios",
      "Maintain aspect ratio or free scaling",
      "Batch resize multiple images at once",
      "Preserve quality with lossless options",
      "Download resized images in original or new format",
      "Preview before saving",
      "Adjust resolution (HD, Full HD, 4K)",
      "One-click resize for social media (Facebook, Instagram, Twitter, LinkedIn, YouTube)",
      "Drag & drop upload support",
      "Supports large files up to 50MB+",
      "Mobile-friendly and responsive",
      "Fast processing, no installation required",
      "No watermark — completely free",
      "Secure, browser-based, no data stored",
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
      <ImageResizeClient />
    </div>
  );
}
