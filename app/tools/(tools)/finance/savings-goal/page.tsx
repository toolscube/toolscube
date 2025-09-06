import JsonLd from "@/components/seo/json-ld";
import SavingsGoalClient from "@/components/tools/finance/savings-goal-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Savings Goal • Tools Hub",
  description: "Figure out how much you need to save per month to reach a target by a deadline.",
  path: "/tools/finance/savings-goal",
  keywords: [
    "savings goal",
    "savings calculator",
    "monthly savings",
    "goal tracker",
    "budgeting",
    "compound interest",
    "finance",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Savings Goal — Tools Hub",
    url: `${site}/tools/finance/savings-goal`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Calculate how much to save per month/week to hit a target by a chosen date. Supports current balance, interest/APY, and compounding.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Target amount + deadline",
      "Current balance & monthly/weekly contributions",
      "Interest/APY with compounding",
      "Projection chart & progress",
      "What-if scenarios",
      "Export CSV/JSON & import JSON",
      "Print/Save as PDF",
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
      <SavingsGoalClient />
    </div>
  );
}
