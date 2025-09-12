import JsonLd from "@/components/seo/json-ld";
import TimeZoneConverterClient from "@/components/tools/time/timezone-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Time Zone Converter • Tools Hub",
  description:
    "Convert time across different cities and countries instantly. Compare time zones, plan meetings, and copy or share results with ease.",
  path: "/tools/time/timezone",
  keywords: [
    "time zone converter",
    "world clock",
    "city time converter",
    "timezone comparison",
    "convert time online",
    "time difference calculator",
    "meeting time planner",
    "compare time zones",
    "timezone converter app",
    "convert PST to EST",
    "convert IST to GMT",
    "convert CST to EST",
    "convert UTC to local time",
    "convert Bangladesh time",
    "convert New York to London time",
    "convert Dubai to Dhaka time",
    "multi timezone comparison",
    "DST daylight savings aware",
    "international meeting scheduler",
    "copy and share converted time",
    "export timezone results",
    "time zone calculator",
    "current time by city",
    "time zone planner tool",
    "Tools Hub",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/time/timezone`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Time Zone Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Convert and compare time zones across cities worldwide. Supports DST, meeting planning, and instant copy/share of results.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Search & select cities worldwide with autocomplete",
      "Compare multiple time zones side by side",
      "Daylight Savings Time (DST) aware conversion",
      "Instantly calculate time differences",
      "Meeting planner with cross-timezone suggestions",
      "Copy/share converted times with one click",
      "Export timezone comparisons to CSV/JSON",
      "Highlight working hours (local vs remote)",
      "Mobile-friendly and responsive design",
      "Offline-capable — runs in your browser",
      "Completely free and privacy-friendly (no signup)",
    ],
    creator: {
      "@type": "Organization",
      name: "Tools Hub",
      url: siteURL,
    },
    potentialAction: {
      "@type": "FindAction",
      target: toolUrl,
      name: "Convert time zones",
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
      { "@type": "ListItem", position: 3, name: "Time Zone Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I convert time between cities?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enter or select two cities, and the Time Zone Converter will instantly show you the converted time, accounting for time zone differences and DST.",
        },
      },
      {
        "@type": "Question",
        name: "Does this tool account for Daylight Savings Time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The converter is DST-aware and will show the correct time differences depending on the current date.",
        },
      },
      {
        "@type": "Question",
        name: "Can I compare multiple time zones at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can add multiple cities and view their times side by side for easy comparison and planning.",
        },
      },
      {
        "@type": "Question",
        name: "Is this tool free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Time Zone Converter is completely free, works offline, and requires no signup.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <TimeZoneConverterClient />
    </div>
  );
}
