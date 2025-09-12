import JsonLd from "@/components/seo/json-ld";
import WeekNumberClient from "@/components/tools/time/week-number-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ISO Week Number",
  description:
    "Find the ISO week number, ISO week-year, and Monday–Sunday date range for any date. Timezone-safe, leap-year aware, and copy/share friendly.",
  path: "/tools/time/weekno",
  keywords: [
    "ISO week",
    "week number",
    "week of year",
    "calendar week",
    "ISO 8601 week",
    "week-year",
    "date range calculator",
    "week number calculator",
    "find week number",
    "fiscal week calculator",
    "business week number",
    "academic week finder",
    "school week calendar",
    "work week tracker",
    "ISO week-year calculator",
    "DST-safe week number",
    "timezone aware week number",
    "copy week number",
    "export week data",
    "week date range",
    "week Monday to Sunday",
    "week start end dates",
    "Tools Hub",
    "time tools",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/time/weekno`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ISO Week Number — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Find ISO week number, ISO week-year, and Monday–Sunday range for any date. DST-safe, leap-year aware, and timezone friendly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Instant ISO week number for today's date",
      "Enter any date to find its week number",
      "Show ISO week-year (different from calendar year when needed)",
      "Display Monday–Sunday date range",
      "DST-safe and timezone aware calculations",
      "Leap-year aware logic",
      "Copy or share results with one click",
      "Export week details to TXT/CSV",
      "Responsive and mobile-friendly design",
      "Privacy-first: works entirely in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Find ISO week number for a date",
    },
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
      { "@type": "ListItem", position: 3, name: "ISO Week Number", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an ISO week number?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The ISO week number is defined by the ISO 8601 standard. Each week starts on Monday, and week 1 is the week with the year's first Thursday.",
        },
      },
      {
        "@type": "Question",
        name: "Why does the ISO week-year differ from the calendar year?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The ISO week-year can differ from the calendar year when a week spans across two years. For example, Dec 31 may fall into week 1 of the next ISO week-year.",
        },
      },
      {
        "@type": "Question",
        name: "Is this calculator timezone safe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool uses timezone-safe calculations so results remain consistent regardless of your location.",
        },
      },
      {
        "@type": "Question",
        name: "Can I find the start and end dates of a week?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool shows the full Monday–Sunday date range for the chosen week.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <WeekNumberClient />
    </div>
  );
}
