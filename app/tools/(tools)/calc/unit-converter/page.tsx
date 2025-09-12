import JsonLd from "@/components/seo/json-ld";
import UnitConverterClient from "@/components/tools/calc/unit-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Unit Converter • Tools Hub",
  description:
    "Free online unit converter for length, weight, temperature, volume, area, speed, energy, time, digital storage, and more. Accurate, fast, and mobile-friendly.",
  path: "/tools/calc/unit-converter",
  keywords: [
    "unit converter",
    "convert units online",
    "measurement converter",
    "real-time unit conversion",
    "engineering unit converter",
    "scientific unit calculator",
    "length converter",
    "distance converter",
    "weight converter",
    "mass converter",
    "temperature converter",
    "Celsius to Fahrenheit",
    "Kelvin converter",
    "volume converter",
    "liters to gallons",
    "ml to cups",
    "area converter",
    "sq ft to sq m",
    "hectares to acres",
    "speed converter",
    "km/h to mph",
    "knots to m/s",
    "time converter",
    "seconds to hours",
    "days to weeks",
    "digital storage converter",
    "MB to GB",
    "KB to MB",
    "data unit converter",
    "energy converter",
    "joules to calories",
    "power converter",
    "watts to horsepower",
    "scientific calculator units",
    "quick conversion tool",
    "multi-unit converter",
    "Tools Hub",
    "calculators",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/unit-converter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Unit Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Accurate, fast, and free unit converter for everyday use. Convert length, weight, temperature, volume, area, speed, energy, time, digital storage, and more instantly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert length, weight, temperature, volume, area, and speed",
      "Supports time, energy, power, digital storage, and more",
      "Instant real-time conversion as you type",
      "Switch between metric, imperial, and scientific units",
      "Popular presets (Celsius↔Fahrenheit, kg↔lbs, km↔miles, etc.)",
      "Multi-unit output (see conversions in several units at once)",
      "Copy, share, and export results (CSV/JSON)",
      "Mobile-friendly responsive interface",
      "Offline-capable — works without internet",
      "Completely free and privacy-first (local only)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Convert units online",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${siteURL}/tools/calc` },
      { "@type": "ListItem", position: 3, name: "Unit Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What units can I convert with this tool?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The unit converter supports length, weight, temperature, volume, area, speed, energy, time, digital storage, and many other measurements.",
        },
      },
      {
        "@type": "Question",
        name: "Does the converter support both metric and imperial units?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can convert between metric (e.g., cm, kg, liters) and imperial (e.g., inches, pounds, gallons) units.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use the unit converter offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool saves recent conversions locally, so you can continue using it even without an internet connection.",
        },
      },
      {
        "@type": "Question",
        name: "Is this unit converter free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. It is completely free, privacy-friendly, and requires no signup or installation.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <UnitConverterClient />
    </div>
  );
}
