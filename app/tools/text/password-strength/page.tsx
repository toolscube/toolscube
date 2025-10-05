import JsonLd from "@/components/seo/json-ld";
import PasswordStrengthClient from "@/components/tools/text/password-strength-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Password Strength",
  description:
    "Check password strength and entropy instantly. Analyze character sets, estimate crack time, and get actionable tips to improve security. Free, private, and fast.",
  path: "/tools/text/password-strength",
  keywords: [
    // core intents
    "password strength checker",
    "check password strength",
    "password security check",
    "password meter",
    "password score",
    // security/tech
    "password entropy",
    "entropy calculator",
    "brute force estimate",
    "crack time estimate",
    "character set analysis",
    "lowercase uppercase numbers symbols",
    "common patterns detection",
    "reused password warning",
    // best practices
    "strong password tips",
    "how to create strong password",
    "passphrase generator guidance",
    "two factor authentication",
    // product & locale
    "Tools Cube",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/text/password-strength`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Password Strength — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online password strength checker. Calculates entropy, analyzes character variety, detects common patterns, and estimates crack time — locally in your browser.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Instant strength score & entropy (bits)",
      "Character set analysis: lowercase, UPPERCASE, digits, symbols",
      "Common pattern checks (repeats, sequences, keyboard walks)",
      "Crack-time estimation (online/offline attacker models)",
      "Actionable tips to strengthen weak passwords",
      "Privacy-first: evaluation runs entirely in your browser",
      "No storage or network requests for entered passwords",
      "Mobile-friendly UI with live feedback",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "AssessAction",
      target: toolUrl,
      name: "Check your password strength",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "URL", item: `${siteURL}/tools#cat-text` },
      { "@type": "ListItem", position: 3, name: "Password Strength", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you upload or store my password?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All checks run locally in your browser. We don’t send, log, or store any passwords or inputs.",
        },
      },
      {
        "@type": "Question",
        name: "What does entropy mean?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Entropy (in bits) estimates how unpredictable a password is. Higher entropy generally means a stronger password that is harder to brute-force.",
        },
      },
      {
        "@type": "Question",
        name: "How can I create a strong password?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use a long passphrase (12–16+ chars) with mixed character sets, avoid common words/patterns, and don’t reuse passwords. A password manager helps generate and store unique passwords.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <PasswordStrengthClient />
    </div>
  );
}
