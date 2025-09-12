import JsonLd from "@/components/seo/json-ld";
import SavingsGoalClient from "@/components/tools/finance/savings-goal-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Savings Goal Calculator • Tools Hub",
  description:
    "Find out how much you need to save per month or week to reach your financial goals by a target date. Supports interest, APY, compounding, and progress tracking.",
  path: "/tools/finance/savings-goal",
  keywords: [
    "savings goal",
    "savings goal calculator",
    "monthly savings calculator",
    "weekly savings calculator",
    "how much to save",
    "goal tracker",
    "financial goal planner",
    "compound interest calculator",
    "APY calculator",
    "interest calculator",
    "projection chart savings",
    "budget planning",
    "personal finance tool",
    "investment goal calculator",
    "retirement savings calculator",
    "college savings calculator",
    "emergency fund calculator",
    "vacation savings calculator",
    "car savings calculator",
    "set financial goals",
    "track savings progress",
    "what if savings scenario",
    "save money planner",
    "finance tools",
    "online tools",
    "privacy friendly tools",
    "Tools Hub",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/finance/savings-goal`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Savings Goal Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Calculate how much you need to save per month or week to reach your financial target. Supports current balance, APY, compounding, projections, and progress tracking.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Set target amount and deadline (monthly/weekly planning)",
      "Input current savings balance",
      "Add regular contributions: monthly, weekly, or custom",
      "Interest & APY support with compounding frequency (daily, monthly, yearly)",
      "Projection chart showing balance growth over time",
      "Track progress percentage toward your savings goal",
      "What-if scenarios: adjust amount, timeline, or rate",
      "Breakdown of total contributions vs. interest earned",
      "Export to CSV/JSON and print/save as PDF",
      "Autosave progress locally in browser",
      "Supports multiple goals (vacation, emergency fund, retirement, etc.)",
      "Fast, mobile-friendly, and privacy-first — runs in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "PlanAction",
      target: toolUrl,
      name: "Calculate your savings goal",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Finance", item: `${siteURL}/tools#cat-finance` },
      { "@type": "ListItem", position: 3, name: "Savings Goal", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does the savings goal calculator work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enter your target amount, deadline, and current savings. The tool calculates how much you need to save per month or week to reach your goal. You can also add interest or APY for more accurate projections.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool support compound interest?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can add an interest rate or APY and choose compounding frequency (daily, monthly, yearly) to see how your savings grow over time.",
        },
      },
      {
        "@type": "Question",
        name: "Can I track multiple goals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can set and calculate multiple savings goals, such as retirement, college fund, vacation, or emergency savings.",
        },
      },
      {
        "@type": "Question",
        name: "Is my financial data stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All calculations run locally in your browser. Data is not uploaded or stored on servers, making it a privacy-friendly finance tool.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <SavingsGoalClient />
    </div>
  );
}
