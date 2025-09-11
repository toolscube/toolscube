import JsonLd from "@/components/seo/json-ld";
import AgeCalculatorClient from "@/components/tools/time/age-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Age Calculator • Tools Hub",
  description:
    "Instantly calculate exact age from date of birth — years, months, days, and next birthday — timezone-safe and leap-year aware. Copy and share results easily.",
  path: "/tools/time/age",
  keywords: [
    "age calculator",
    "DOB to age",
    "date of birth calculator",
    "how old am I",
    "calculate exact age",
    "years months days",
    "next birthday",
    "age in days",
    "age in months",
    "age in weeks",
    "weekday of next birthday",
    "timezone safe age",
    "leap year aware age",
    "copy age result",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/time/age`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Age Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Calculate precise age from date of birth with breakdown in years, months, and days. Shows next birthday and weekday. Timezone-safe and leap-year aware.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "DOB picker with Today shortcut",
      "Exact age: years, months, days",
      "Age in total days / weeks / months",
      "Next birthday date & weekday",
      "Timezone-safe calculations",
      "Leap-year aware logic",
      "Copy & share results instantly",
      "Privacy-first: runs in your browser",
      "Mobile-friendly UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate age from date of birth",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Date & Time", item: `${siteURL}/tools/time` },
      { "@type": "ListItem", position: 3, name: "Age Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does the calculator handle leap years?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. It accounts for leap years when computing the exact difference in years, months, and days.",
        },
      },
      {
        "@type": "Question",
        name: "Are results affected by my timezone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool is timezone-safe. Calculations are performed consistently to avoid date-shift issues across timezones.",
        },
      },
      {
        "@type": "Question",
        name: "Can I copy or share the result?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can copy the formatted age breakdown and share it anywhere.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <AgeCalculatorClient />
    </div>
  );
}
