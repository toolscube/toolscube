import JsonLd from "@/components/seo/json-ld";
import EMICalculatorClient from "@/components/tools/calc/emi-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Loan / EMI Calculator",
  description:
    "Calculate monthly EMI, total interest, and amortization schedule for home, auto, or personal loans. Supports extra payments, prepayment, APR, and comparison.",
  path: "/tools/calc/emi",
  keywords: [
    "EMI calculator",
    "loan calculator",
    "monthly payment calculator",
    "mortgage calculator",
    "car loan calculator",
    "personal loan calculator",
    "home loan calculator",
    "interest rate calculator",
    "amortization schedule",
    "principal and interest",
    "total interest paid",
    "loan tenure",
    "effective interest rate",
    "APR calculator",
    "reducing balance",
    "extra payment calculator",
    "prepayment loan calculator",
    "lump sum prepayment",
    "biweekly payments",
    "compare two loans",
    "loan payoff date",
    "early payoff calculator",
    "EMI breakdown chart",
    "amortization export CSV",
    "amortization export PDF",
    "finance tools",
    "calculators",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/emi`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan / EMI Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Compute EMI, interest, and full amortization for home, auto, or personal loans. Model extra payments, prepayment, APR, and compare scenarios.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Monthly EMI calculation from principal, rate, and tenure",
      "Amortization schedule with principal/interest breakdown",
      "Total interest and total payment summaries",
      "Support for annual, monthly, or custom compounding",
      "Extra payments (monthly top-ups) and one-time lump-sum prepayment",
      "Early payoff projection and new payoff date",
      "APR / effective rate estimate (fees & charges optional)",
      "Biweekly/weekly repayment mode (optional)",
      "Side-by-side loan comparison",
      "Interactive charts: balance, interest vs principal",
      "Export schedule to CSV/JSON and print to PDF",
      "Autosave locally, offline-capable, privacy-first",
      "Mobile-friendly responsive UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate loan EMI and amortization",
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
      { "@type": "ListItem", position: 3, name: "Loan / EMI Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is EMI and how is it calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EMI (Equated Monthly Installment) is the fixed payment you make every month. It’s computed using the principal, interest rate, and tenure via the standard amortizing loan formula.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add extra payments or prepayments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can add recurring extra payments and one-time lump-sum prepayments to reduce interest and shorten the payoff time.",
        },
      },
      {
        "@type": "Question",
        name: "Does the calculator show an amortization schedule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. It shows a month-by-month breakdown of principal and interest, remaining balance, and totals. You can export it to CSV/JSON or print to PDF.",
        },
      },
      {
        "@type": "Question",
        name: "What is APR and how is it different from the interest rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "APR includes the interest rate plus certain fees, giving a more complete picture of borrowing cost. The tool can estimate APR if you enter fees.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Calculations run locally in your browser. Data is saved only to your device if you use autosave or export.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <EMICalculatorClient />
    </div>
  );
}
