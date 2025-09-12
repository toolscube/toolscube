import JsonLd from "@/components/seo/json-ld";
import CurrencyConverterClient from "@/components/tools/calc/currency-converter-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Currency Converter • Tools Hub",
  description:
    "Convert currencies with live exchange rates. Supports 150+ currencies worldwide including USD, EUR, GBP, BDT, INR, and more. Fast, free, and accurate.",
  path: "/tools/calc/currency",
  keywords: [
    "currency converter",
    "convert currencies",
    "live exchange rates",
    "forex calculator",
    "exchange rate converter",
    "multi-currency converter",
    "money exchange calculator",
    "USD to EUR",
    "EUR to USD",
    "GBP to USD",
    "USD to BDT",
    "BDT to USD",
    "INR to USD",
    "AUD to USD",
    "CAD to USD",
    "JPY to USD",
    "real-time forex rates",
    "currency conversion app",
    "currency calculator",
    "offline currency converter",
    "currency with charts",
    "multi-currency conversion",
    "currency history",
    "cross-currency exchange",
    "Tools Hub",
    "calculators",
    "finance tools",
    "Bangladesh",
    "online tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/currency`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Currency Converter — Tools Hub",
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Live currency converter with real-time exchange rates. Supports 150+ currencies, quick swap, offline mode, and historical data.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert between 150+ world currencies instantly",
      "Real-time forex rates with frequent updates",
      "Popular quick pairs (USD↔EUR, USD↔BDT, GBP↔USD, etc.)",
      "Swap currencies with one click",
      "Multi-currency conversion (convert one to many)",
      "Favorite currencies for faster access",
      "Offline fallback with last saved rates",
      "Historical charts & data export (CSV/JSON)",
      "Copy & share results quickly",
      "Responsive, mobile-friendly interface",
      "Completely free & privacy-friendly",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Convert currencies online",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${siteURL}/tools/calc` },
      { "@type": "ListItem", position: 3, name: "Currency Converter", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How accurate are the currency conversion rates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool updates exchange rates frequently using live market data. Rates are accurate for general use but may differ slightly from bank or money exchange rates.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use the currency converter offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The converter stores the last available exchange rates locally, so you can still perform conversions without internet access.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool support historical exchange rates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can view historical currency data and export results as CSV or JSON for analysis.",
        },
      },
      {
        "@type": "Question",
        name: "Is this currency converter free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. It is completely free, privacy-friendly, and requires no signup.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <CurrencyConverterClient />
    </div>
  );
}
