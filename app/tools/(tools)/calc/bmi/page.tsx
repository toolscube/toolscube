import JsonLd from "@/components/seo/json-ld";
import BMICalculatorClient from "@/components/tools/calc/bmi-calculator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "BMI Calculator",
  description:
    "Free online BMI Calculator. Calculate your Body Mass Index instantly using height and weight. Supports metric/imperial units, shows BMI categories, and provides healthy weight ranges.",
  path: "/tools/calc/bmi",
  keywords: [
    "BMI calculator",
    "body mass index calculator",
    "BMI chart",
    "BMI categories",
    "calculate BMI online",
    "BMI healthy weight",
    "BMI formula",
    "underweight BMI",
    "normal BMI",
    "overweight BMI",
    "obesity BMI",
    "adult BMI calculator",
    "child BMI calculator",
    "WHO BMI standard",
    "BMI health risk",
    "BMI metric calculator",
    "BMI imperial calculator",
    "height weight calculator",
    "BMI percentile",
    "BMI ranges",
    "BMI copy share export",
    "health calculator",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/calc/bmi`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMI Calculator — Tools Hub",
    url: toolUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Calculate your Body Mass Index (BMI) instantly using height and weight. Supports metric and imperial units, shows BMI categories, and provides health ranges.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Enter height and weight to calculate BMI instantly",
      "Supports both metric (cm/kg) and imperial (ft/in, lbs) units",
      "BMI categories: Underweight, Normal, Overweight, Obese",
      "Shows healthy weight range for given height",
      "Highlights BMI risk category (color-coded)",
      "Copy/share results easily",
      "Export results to CSV/JSON",
      "Responsive design — works on mobile and desktop",
      "Privacy-first: runs entirely in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate BMI from height and weight",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${siteURL}/tools/calc` },
      { "@type": "ListItem", position: 3, name: "BMI Calculator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is BMI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BMI stands for Body Mass Index. It is a simple calculation using height and weight to determine whether a person is underweight, normal, overweight, or obese.",
        },
      },
      {
        "@type": "Question",
        name: "Is BMI accurate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BMI is a useful screening tool for weight categories but does not measure body fat directly. Factors like muscle mass can affect accuracy.",
        },
      },
      {
        "@type": "Question",
        name: "Does this calculator support metric and imperial units?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can input your height and weight in metric (cm/kg) or imperial (ft/in, lbs) units.",
        },
      },
      {
        "@type": "Question",
        name: "What are the BMI categories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The World Health Organization defines BMI categories as: Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), and Obese (30 or higher).",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <BMICalculatorClient />
    </div>
  );
}
