import JsonLd from "@/components/seo/json-ld";
import SalaryHourlyClient from "@/components/tools/finance/salary-hourly-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Salary ↔ Hourly Pay Calculator",
  description:
    "Convert annual salary to hourly, daily, weekly, or monthly pay. PTO-aware effective hourly rate, currency presets, overtime options, and quick exports.",
  path: "/tools/finance/salary-hourly",
  keywords: [
    "salary to hourly",
    "hourly to salary",
    "salary calculator",
    "hourly wage calculator",
    "convert salary to hourly",
    "convert hourly to salary",
    "annual salary calculator",
    "monthly salary calculator",
    "weekly pay calculator",
    "daily wage calculator",
    "income calculator",
    "wage to income converter",
    "PTO calculator",
    "effective hourly rate",
    "overtime calculator",
    "net vs gross income",
    "currency presets",
    "rounding calculator",
    "work hours per week",
    "work days per week",
    "weeks per year",
    "pay conversion tool",
    "finance tools",
    "Tools Hub",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/finance/salary-hourly`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salary ↔ Hourly Pay Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Convert between annual salary and hourly/day/week/month pay. Adjust for PTO, overtime, currency presets, and export results easily.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert annual salary ↔ hourly wage instantly",
      "Breakdown by daily, weekly, monthly, and yearly pay",
      "Custom inputs: hours per week, days per week, weeks per year",
      "PTO-aware effective hourly calculation (optional)",
      "Overtime adjustments and custom hourly rates",
      "Currency presets and rounding controls",
      "Net vs. gross pay comparison (if tax rate provided)",
      "Copy results, export CSV/JSON, or print/save as PDF",
      "Autosave settings in local storage",
      "Fast, mobile-friendly, and privacy-first — runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Convert salary to hourly pay",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Finance", item: `${siteURL}/tools#cat-finance` },
      { "@type": "ListItem", position: 3, name: "Salary ↔ Hourly", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I convert salary to hourly pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Divide your annual salary by the total number of hours you work per year. This tool automates the math for daily, weekly, monthly, and yearly schedules.",
        },
      },
      {
        "@type": "Question",
        name: "Does the calculator consider paid time off (PTO)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can include PTO days to see an effective hourly rate that accounts for time off.",
        },
      },
      {
        "@type": "Question",
        name: "Can I switch between hourly, daily, weekly, and monthly pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enter any one value (hourly, daily, weekly, monthly, or annual), and the calculator will show equivalent amounts for the other units.",
        },
      },
      {
        "@type": "Question",
        name: "Is my salary data stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All calculations run locally in your browser. We do not upload, log, or store your financial data.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <SalaryHourlyClient />
    </div>
  );
}
