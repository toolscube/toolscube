import JsonLd from "@/components/seo/json-ld";
import SimpleInvoiceClient from "@/components/tools/office/simple-invoice-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Simple Invoice • Tools Hub",
  description:
    "Create and download a clean invoice fast. Add items, tax, discounts, shipping, mark as paid, and export to PDF/CSV/JSON.",
  path: "/tools/office/invoice",
  keywords: [
    "invoice",
    "invoice generator",
    "simple invoice",
    "create invoice",
    "invoice PDF",
    "invoice CSV",
    "billing",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simple Invoice — Tools Hub",
    url: `${site}/tools/office/invoice`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Quickly create invoices with items, discounts, tax, shipping, and paid status. Export to PDF/CSV/JSON.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Add/clone/remove line items",
      "Discount & tax",
      "Shipping",
      "Paid status & balance due",
      "CSV/JSON export & JSON import",
      "Print to PDF",
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
      <SimpleInvoiceClient />
    </div>
  );
}
