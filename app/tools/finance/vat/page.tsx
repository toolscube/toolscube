import JsonLd from "@/components/seo/json-ld";
import VatCalculatorClient from "@/components/tools/finance/vat-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "GST/VAT Calculator",
  description:
    "Add or remove GST/VAT from any price. Convert between tax-inclusive and tax-exclusive amounts instantly. Custom rates, rounding, net/gross breakdowns, and export options.",
  path: "/tools/finance/vat",
  keywords: [
    "VAT calculator",
    "GST calculator",
    "tax calculator",
    "add VAT",
    "remove VAT",
    "add GST",
    "remove GST",
    "tax inclusive to exclusive",
    "tax exclusive to inclusive",
    "net to gross calculator",
    "gross to net calculator",
    "custom tax rate calculator",
    "rounding calculator",
    "copy net tax gross",
    "export CSV JSON",
    "import JSON finance",
    "offline finance tool",
    "VAT GST breakdown",
    "UK VAT calculator",
    "EU VAT calculator",
    "India GST calculator",
    "Bangladesh VAT calculator",
    "US sales tax calculator",
    "finance tools",
    "budget calculator",
    "invoice calculator",
    "Tools Cube",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/finance/vat`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GST/VAT Calculator — Tools Cube",
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Instantly add or remove GST/VAT from any price. Switch between tax-inclusive and tax-exclusive values, with rounding, export, and offline support.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert inclusive ⇄ exclusive prices (net/gross)",
      "Custom tax rate entry with quick presets (5%, 7.5%, 15%, 20%)",
      "Support for multiple countries: VAT (UK, EU, Bangladesh) and GST (India, others)",
      "Breakdown view: net, tax, and gross values",
      "Round results to 2 decimals (toggle on/off)",
      "Copy individual values or full breakdown",
      "Export results to CSV or JSON; import JSON later",
      "Print/Save as PDF for invoices or reports",
      "Autosave last calculation to local storage",
      "Works offline — runs locally in your browser",
      "No signup, free forever, privacy-friendly",
      "Mobile-friendly UI with light/dark mode",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate GST or VAT",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Finance", item: `${siteURL}/tools#cat-finance` },
      { "@type": "ListItem", position: 3, name: "GST/VAT Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the difference between VAT-inclusive and VAT-exclusive prices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VAT-inclusive means the price already includes tax. VAT-exclusive means tax will be added to the base price. This calculator lets you switch between them instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I set a custom tax rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can enter any custom GST/VAT rate or use quick presets like 5%, 7.5%, 15%, or 20%.",
        },
      },
      {
        "@type": "Question",
        name: "Does this tool support international VAT and GST?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. It works for VAT in the UK, EU, Bangladesh, and GST in India and other regions. You can set your own rate to match your country's tax rules.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored when I use the calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All calculations run locally in your browser. We don’t upload, log, or store your financial data.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <VatCalculatorClient />
    </div>
  );
}
