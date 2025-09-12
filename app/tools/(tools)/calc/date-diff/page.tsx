import JsonLd from "@/components/seo/json-ld";
import DateDifferenceClient from "@/components/tools/calc/date-difference-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Date Difference Calculator",
  description:
    "Find the exact difference between two dates in days, weeks, months, and years. Weekday/business days, exclude holidays, timezone-safe, and leap-year aware.",
  path: "/tools/calc/date-diff",
  keywords: [
    "date difference",
    "days between dates",
    "date duration calculator",
    "date interval calculator",
    "count days",
    "count weeks",
    "count months",
    "count years",
    "business days calculator",
    "weekdays only",
    "exclude weekends",
    "exclude holidays",
    "include end date",
    "time difference",
    "hours minutes seconds",
    "timezone safe date",
    "DST safe date",
    "leap year aware",
    "project timeline calculator",
    "age in days",
    "visa application days",
    "deadline calculator",
    "workdays calculator",
    "school days calculator",
    "Tools Hub",
    "calculators",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/date-diff`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Date Difference Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Calculate the precise difference between two dates and times. Get totals in days, weeks, months, and years. Supports business days, holiday exclusions, and timezone-safe math.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Difference between two dates (start/end) with include-end toggle",
      "Totals in days, weeks, months, years — plus hours, minutes, seconds (optional)",
      "Business days / weekdays-only mode (exclude weekends)",
      "Custom holiday list to exclude public holidays",
      "Timezone-safe and DST-safe calculations",
      "Leap-year aware date math",
      "Quick presets: Today, Yesterday, Last 7/30/90 days, This/Last month",
      "Copy/share results; export CSV/JSON; print-friendly view",
      "Local autosave (privacy-friendly, no signup)",
      "Responsive, mobile-friendly interface",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate days between two dates",
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
        name: "Calculators",
        item: `${siteURL}/tools#cat-calculators`,
      },
      { "@type": "ListItem", position: 3, name: "Date Difference", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I count the number of days between two dates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select a start and end date and the calculator will show the exact difference. You can also choose whether to include the end date.",
        },
      },
      {
        "@type": "Question",
        name: "Can I calculate business days only?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enable weekdays-only to exclude weekends, and optionally provide a holiday list to exclude specific dates.",
        },
      },
      {
        "@type": "Question",
        name: "Does the calculator handle leap years and timezones?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool is leap-year aware and uses timezone/DST-safe calculations for consistent results.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export or share the results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can copy a formatted summary, share a permalink, or export to CSV/JSON for reports and archiving.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <DateDifferenceClient />
    </div>
  );
}
