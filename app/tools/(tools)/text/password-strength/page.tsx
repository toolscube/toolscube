import JsonLd from "@/components/seo/json-ld";
import PasswordStrengthClient from "@/components/tools/text/password-strength-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Password Strength • Tools Hub",
  description:
    "Check your password strength instantly. Analyze entropy, length, character sets, and get hints to improve security. Free online password strength checker.",
  path: "/tools/text/password-strength",
  keywords: [
    "password strength checker",
    "password entropy",
    "strong password",
    "password security",
    "check password strength",
    "password hints",
    "Tools Hub",
  ],
});

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Password Strength — Tools Hub",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/password-strength`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Free online password strength checker. Measure password entropy, analyze character variety, and get actionable hints to improve your security.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Check password length and entropy",
      "Analyze character variety (lowercase, uppercase, numbers, symbols)",
      "Estimate brute-force cracking time",
      "Get hints to create stronger passwords",
      "Free and instant password strength checker",
    ],
    creator: {
      "@type": "Personal",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <PasswordStrengthClient />
    </div>
  );
}
