import JsonLd from "@/components/seo/json-ld";
import ColorConverterClient from "@/components/tools/dev/color-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Color Converter",
  description:
    "Convert HEX, RGB, HSL, HSV, and CMYK color values instantly. Preview colors live, copy codes, adjust alpha, and generate palettes. Free online color converter.",
  path: "/tools/dev/color-converter",
  keywords: [
    "color converter",
    "HEX to RGB",
    "RGB to HEX",
    "RGB to HSL",
    "HSL to RGB",
    "CMYK converter",
    "HSV converter",
    "color values",
    "color picker",
    "alpha transparency",
    "convert colors online",
    "CSS colors",
    "web design colors",
    "UI design color tool",
    "developer tools",
    "Tools Cube",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/color-converter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Color Converter — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online color converter. Convert between HEX, RGB, HSL, HSV, and CMYK. Preview colors live, adjust transparency, copy codes, and generate palettes instantly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert between HEX, RGB, HSL, HSV, CMYK",
      "Live preview of selected color",
      "Alpha transparency slider (RGBA/HSLA)",
      "One-click copy color codes",
      "Batch convert multiple values",
      "Generate complementary and triadic palettes",
      "Dark/light contrast checker",
      "Export palettes to JSON/CSV",
      "Responsive and mobile-friendly design",
      "Offline capable, privacy-first (runs in browser)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ConvertAction",
      target: toolUrl,
      name: "Convert color codes online",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Inputs", value: "HEX, RGB, HSL, HSV, CMYK" },
      {
        "@type": "PropertyValue",
        name: "Outputs",
        value: "Formatted HEX, RGB, HSL, HSV, CMYK, with preview",
      },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Developer",
        item: `${siteURL}/tools#cat-developer`,
      },
      { "@type": "ListItem", position: 3, name: "Color Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What color models does this tool support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It supports HEX, RGB, HSL, HSV, and CMYK. You can convert between any of them instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I preview the color live?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool shows a live preview of the selected or converted color, including transparency.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support alpha values?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can adjust alpha transparency and copy RGBA or HSLA values.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate palettes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool can generate complementary, triadic, or random palettes and export them to JSON/CSV.",
        },
      },
      {
        "@type": "Question",
        name: "Does this tool run locally?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All conversions and previews run in your browser with no server upload.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <ColorConverterClient />
    </div>
  );
}
