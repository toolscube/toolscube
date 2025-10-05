import JsonLd from "@/components/seo/json-ld";
import AgeCalculatorClient from "@/components/tools/time/age-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Age Calculator",
  description:
    "Instantly calculate exact age from date of birth — years, months, days, and next birthday. Timezone-safe, leap-year aware, and privacy-friendly.",
  path: "/tools/time/age",
  keywords: [
    "age calculator",
    "DOB to age",
    "date of birth calculator",
    "how old am I",
    "calculate exact age",
    "age finder online",
    "age difference calculator",
    "years months days",
    "age in days",
    "age in weeks",
    "age in months",
    "age in hours",
    "age in minutes",
    "next birthday",
    "weekday of next birthday",
    "half birthday",
    "timezone safe age",
    "leap year aware age",
    "accurate age calculator",
    "date math",
    "school admission age",
    "job application age",
    "visa age calculator",
    "insurance age calculator",
    "medical age calculator",
    "copy age result",
    "share age result",
    "export age details",
    "Tools Cube",
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
    name: "Age Calculator — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Calculate precise age from date of birth with breakdown in years, months, and days. Shows next birthday and weekday. Timezone-safe and leap-year aware.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "DOB picker with Today/Now shortcuts",
      "Exact age: years, months, days (plus total days, weeks, months)",
      "Fine-grained age: hours and minutes (optional)",
      "Next birthday date, weekday, and countdown",
      "Half-birthday highlight (optional)",
      "Age difference between two dates (compare mode)",
      "Timezone-safe calculations; leap-year aware",
      "Copy & share formatted results; quick permalink",
      "Export age breakdown to CSV/TXT/JSON",
      "Privacy-first: runs locally in your browser",
      "Responsive, mobile-friendly UI with keyboard access",
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
    additionalProperty: [
      { "@type": "PropertyValue", name: "Supports", value: "Gregorian calendar" },
      { "@type": "PropertyValue", name: "Data Storage", value: "Local only" },
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
        name: "Date & Time",
        item: `${siteURL}/tools#cat-date-time`,
      },
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
        name: "Can I see my age in days, weeks, hours, or minutes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can view fine-grained totals such as days, weeks, months, hours, and minutes.",
        },
      },
      {
        "@type": "Question",
        name: "Can I compare two dates (e.g., age difference)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use compare mode to calculate the difference between any two dates, not just DOB and today.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data uploaded or stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs locally in your browser. We do not upload, log, or store your inputs.",
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
