import JsonLd from "@/components/seo/json-ld";
import TimestampConverterClient from "@/components/tools/dev/timestamp-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Timestamp Converter",
  description:
    "Convert UNIX timestamps to human-readable dates and back. Supports seconds/milliseconds, UTC/local time, time zones, ISO/RFC formats, and copy/export.",
  path: "/tools/dev/timestamp-converter",
  keywords: [
    "timestamp converter",
    "unix timestamp",
    "epoch time",
    "epoch converter",
    "seconds since epoch",
    "milliseconds since epoch",
    "timestamp to date",
    "date to timestamp",
    "ISO 8601 converter",
    "RFC 3339 converter",
    "parse ISO date",
    "UTC to local time",
    "timezone converter",
    "DST safe time",
    "current unix time",
    "now timestamp",
    "copy timestamp",
    "format date string",
    "developer tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/timestamp-converter`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Timestamp Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online UNIX timestamp converter. Convert timestamps (seconds/ms) ↔ dates, view UTC/local, apply time zones, and copy/export results. ISO 8601 & RFC 3339 friendly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert UNIX epoch ↔ human-readable date/time",
      "Supports seconds and milliseconds timestamps",
      "View in UTC and Local simultaneously",
      "Choose arbitrary IANA time zones (e.g., Asia/Dhaka, UTC, America/New_York)",
      "Parse/format ISO 8601 & RFC 3339 strings",
      "Show weekday, ISO week number, and day of year",
      "Current time (now) with live tick & copy",
      "Copy individual fields; export CSV/JSON",
      "Permalink to a specific timestamp",
      "DST-safe, leap-year aware calculations",
      "Offline-capable; privacy-first (runs in browser)",
      "Responsive UI with dark mode",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Convert UNIX timestamps online",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Inputs",
        value: "Epoch seconds/ms, ISO/RFC strings, date/time pickers",
      },
      {
        "@type": "PropertyValue",
        name: "Outputs",
        value: "UTC, Local, selected time zone, ISO/RFC strings",
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
      { "@type": "ListItem", position: 3, name: "Timestamp Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a UNIX timestamp?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A UNIX timestamp is the number of seconds (or milliseconds) elapsed since 00:00:00 UTC on 1 January 1970, not counting leap seconds.",
        },
      },
      {
        "@type": "Question",
        name: "What’s the difference between seconds and milliseconds?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Seconds timestamps are 10-digit values (e.g., 1726200000). Milliseconds timestamps are 13-digit values (e.g., 1726200000000). The tool auto-detects and converts both.",
        },
      },
      {
        "@type": "Question",
        name: "Does the converter handle time zones and DST?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can view times in UTC, your local time, or a chosen IANA time zone. Conversions are DST-safe and leap-year aware.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert ISO 8601/RFC 3339 strings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Paste an ISO/RFC string and the tool will parse it into epoch and formatted outputs in multiple zones.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data uploaded anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The converter runs locally in your browser. Nothing is sent to a server unless you export to a file on your device.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <TimestampConverterClient />
    </div>
  );
}
