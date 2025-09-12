import JsonLd from "@/components/seo/json-ld";
import OGBuilderClient from "@/components/tools/seo/og-builder-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "OG Image Builder",
  description:
    "Create custom Open Graph images for social media instantly. Add text, logos, gradients, backgrounds, and export in PNG/JPEG. Perfect for SEO and social previews.",
  path: "/tools/seo/og-builder",
  keywords: [
    "OG image builder",
    "Open Graph image generator",
    "social media image generator",
    "Twitter card image generator",
    "LinkedIn preview image",
    "Facebook share image",
    "SEO image generator",
    "custom OG image",
    "add logo to OG image",
    "gradient background OG image",
    "upload background image",
    "responsive OG generator",
    "download OG image PNG",
    "download OG image JPG",
    "export high resolution social image",
    "blog OG image",
    "article social preview image",
    "product SEO image",
    "portfolio OG image",
    "YouTube thumbnail alternative",
    "meta image generator",
    "SEO tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/seo/og-builder`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OG Image Builder — Tools Hub",
    url: toolUrl,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free OG Image Builder to create custom Open Graph images for SEO and social sharing. Add text, logos, gradients, backgrounds, and export in PNG or JPEG instantly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Custom Open Graph image creator",
      "Add text overlays with fonts & colors",
      "Upload logos and background images",
      "Gradient or solid background support",
      "Responsive canvas with auto-centering",
      "Export images in PNG or JPEG formats",
      "Optimized for Facebook, Twitter, LinkedIn",
      "Supports multiple aspect ratios (1.91:1, 1:1, etc.)",
      "Preview image as it will appear on social media",
      "Download high-resolution images instantly",
      "Privacy-first: runs locally in your browser",
      "Mobile-friendly and offline-capable",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Create custom OG image",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "SEO Tools", item: `${siteURL}/tools/seo` },
      { "@type": "ListItem", position: 3, name: "OG Image Builder", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an OG image?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An OG image (Open Graph image) is the image displayed when a webpage is shared on social media platforms like Facebook, Twitter, or LinkedIn.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add my logo to the OG image?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can upload a logo or watermark and place it anywhere on the OG image canvas.",
        },
      },
      {
        "@type": "Question",
        name: "Does the OG image builder support gradients?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can set gradient backgrounds, solid colors, or even upload a custom background image.",
        },
      },
      {
        "@type": "Question",
        name: "Is this OG image builder free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. It is completely free, browser-based, and privacy-first. No signup or installation required.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <OGBuilderClient />
    </div>
  );
}
