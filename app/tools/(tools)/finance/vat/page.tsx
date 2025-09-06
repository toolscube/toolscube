import JsonLd from "@/components/seo/json-ld";
import VatCalculatorClient from "@/components/tools/finance/vat-calculator-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "GST/VAT Calculator • Tools Hub",
  description:
    "Add or remove tax from a price. Convert between tax-inclusive and tax-exclusive amounts quickly.",
  path: "/tools/finance/vat",
  keywords: [
    "GST",
    "VAT",
    "tax calculator",
    "inclusive price",
    "exclusive price",
    "add tax",
    "remove tax",
    "net",
    "gross",
    "finance tools",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GST/VAT Calculator — Tools Hub",
    url: `${site}/tools/finance/vat`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Instantly add or remove GST/VAT from any price. Switch between tax-inclusive and tax-exclusive amounts, with rounding and copy/export.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Inclusive ⇄ exclusive price conversion",
      "Custom tax rate with quick presets",
      "Round to 2 decimals toggle",
      "Copy net/tax/gross",
      "Export CSV/JSON & import JSON",
      "Autosave to local storage",
      "Works offline (no signup)",
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
      <VatCalculatorClient />
    </div>
  );
}
