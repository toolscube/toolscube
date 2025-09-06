import JsonLd from "@/components/seo/json-ld";
import SalaryHourlyClient from "@/components/tools/finance/salary-hourly-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Salary → Hourly • Tools Hub",
  description:
    "Convert between annual salary and hourly/day/week/month pay rates. PTO-aware effective hourly, flexible schedule assumptions, and quick exports.",
  path: "/tools/finance/salary-hourly",
  keywords: [
    "salary to hourly",
    "hourly to salary",
    "pay rate calculator",
    "annual salary",
    "hourly rate",
    "PTO",
    "wage",
    "income",
    "pay conversion",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salary → Hourly — Tools Hub",
    url: `${site}/tools/finance/salary-hourly`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Convert salary ↔ hourly with options for hours/week, days/week, weeks/year, and paid time off (PTO). Export, copy, and print.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Salary ↔ Hourly, plus daily/weekly/monthly",
      "PTO-aware effective hourly (optional)",
      "Hours/week, days/week, weeks/year controls",
      "Currency presets & rounding",
      "Copy values and export CSV/JSON",
      "Print / Save as PDF",
      "Autosave to local storage",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <SalaryHourlyClient />
    </div>
  );
}