import JsonLd from "@/components/seo/json-ld";
import ImageResizeClient from "@/components/tools/image/image-resize-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Image Resize",
  description:
    "Resize, crop, and scale images online for free. Adjust width, height, aspect ratio, and quality — works with JPG, PNG, WebP, and AVIF.",
  path: "/tools/image/resize",
  keywords: [
    "image resizer",
    "resize image online",
    "crop image online",
    "scale image online",
    "resize photos",
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
    "YouTube thumbnail size",
    "batch image resize",
    "custom image dimensions",
    "maintain aspect ratio",
    "resize without losing quality",
    "compress and resize",
    "HD Full HD 4K resize",
    "no watermark image resize",
    "fast image resize tool",
    "secure online image tool",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/image/resize`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Resize — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
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
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Resize an image",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Image", item: `${siteURL}/tools#cat-image` },
      { "@type": "ListItem", position: 3, name: "Image Resize", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JPG, PNG, WebP, and AVIF are supported for input and output. Browser support may enable additional inputs.",
        },
      },
      {
        "@type": "Question",
        name: "Can I keep the original aspect ratio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can lock aspect ratio to avoid distortion or unlock it for free scaling and cropping.",
        },
      },
      {
        "@type": "Question",
        name: "Are images uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Resizing runs locally in your browser, so your images aren’t uploaded or stored on a server.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <ImageResizeClient />
    </div>
  );
}
