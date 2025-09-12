import JsonLd from "@/components/seo/json-ld";
import SimpleInvoiceClient from "@/components/tools/office/simple-invoice-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Simple Invoice Generator • Tools Hub",
  description:
    "Create professional invoices instantly. Add line items, tax, discounts, shipping, and paid status. Export invoices to PDF, CSV, or JSON. Free and privacy-friendly.",
  path: "/tools/office/invoice",
  keywords: [
    "invoice generator",
    "simple invoice",
    "create invoice",
    "free invoice template",
    "invoice maker online",
    "invoice PDF generator",
    "invoice CSV export",
    "invoice JSON export",
    "online billing tool",
    "add line items",
    "tax and discount invoice",
    "shipping costs invoice",
    "mark invoice as paid",
    "balance due invoice",
    "multi-currency invoice",
    "proforma invoice",
    "receipt generator",
    "download invoice PDF",
    "print invoice online",
    "autosave invoice",
    "freelancer invoice",
    "small business invoice",
    "startup billing tool",
    "consultant invoice generator",
    "service invoice",
    "product invoice",
    "client billing",
    "office tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/office/invoice`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simple Invoice Generator — Tools Hub",
    url: toolUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Quickly create and download invoices with line items, discounts, taxes, shipping, and payment status. Export to PDF, CSV, or JSON.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Add, edit, clone, or remove unlimited line items",
      "Apply discounts (flat or percentage) and multiple tax rates",
      "Add shipping and handling charges",
      "Mark invoices as paid and calculate balance due",
      "Customizable invoice number, date, and due date",
      "Client and vendor details with address fields",
      "Multi-currency support with formatting",
      "Export invoices to PDF, CSV, or JSON; import JSON later",
      "Print-friendly layout for physical copies",
      "Autosave drafts to local storage (no signup required)",
      "Lightweight, mobile-friendly UI",
      "Privacy-first: runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate an invoice",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Office", item: `${siteURL}/tools#cat-office` },
      { "@type": "ListItem", position: 3, name: "Simple Invoice", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I export my invoice as PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can export invoices to PDF with a clean layout suitable for clients and record-keeping.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support multiple currencies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can choose different currencies and the tool will format amounts accordingly.",
        },
      },
      {
        "@type": "Question",
        name: "Is my invoice data saved online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All invoices are generated in your browser. Data is stored locally unless you export it manually.",
        },
      },
      {
        "@type": "Question",
        name: "Who can use this invoice tool?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Freelancers, small businesses, startups, and consultants can all use this tool to quickly generate professional invoices.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <SimpleInvoiceClient />
    </div>
  );
}
