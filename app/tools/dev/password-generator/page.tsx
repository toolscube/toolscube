import JsonLd from "@/components/seo/json-ld";
import PasswordGeneratorClient from "@/components/tools/dev/password-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Password Generator",
  description:
    "Generate secure random passwords and passphrases. Control length, character sets, entropy, and rules. Batch generate, copy, and export — all local and private.",
  path: "/tools/dev/password-generator",
  keywords: [
    "password generator",
    "secure password generator",
    "random password",
    "strong password",
    "passphrase generator",
    "entropy calculator",
    "uppercase lowercase numbers symbols",
    "avoid ambiguous characters",
    "no similar characters",
    "exclude lookalikes",
    "must include rules",
    "regex password rules",
    "pronounceable passwords",
    "diceware passphrase",
    "batch password generator",
    "copy password",
    "export passwords",
    "password length",
    "password policy",
    "developer tools",
    "Tools Cube",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/password-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Password Generator — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Create strong random passwords or passphrases with customizable length, character sets, entropy estimates, and policy rules. Batch generate, copy, and export locally.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Random passwords and passphrases (Diceware-style)",
      "Length control with live entropy estimate (bits)",
      "Character set toggles: upper/lower, digits, symbols",
      "Exclude ambiguous/lookalike chars (O/0, l/1/I, etc.)",
      "Must-include rules & custom regex policy checks",
      "Pronounceable option for easier typing",
      "Batch generation with copy-all and per-line copy",
      "Export to CSV/JSON/TXT; print-friendly sheet",
      "One-click regenerate & clipboard integration",
      "Autosave settings; dark mode; responsive UI",
      "Offline, privacy-first: runs entirely in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate a secure password",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Outputs", value: "Passwords / passphrases with entropy" },
      { "@type": "PropertyValue", name: "Export", value: "CSV, JSON, TXT" },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Developer",
        item: `${siteURL}/tools#cat-developer`,
      },
      { "@type": "ListItem", position: 3, name: "Password Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What makes a password strong?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Length and randomness are key. Use 12–16+ characters and a mix of character sets. The tool shows an entropy estimate to help you gauge strength.",
        },
      },
      {
        "@type": "Question",
        name: "Are the generated passwords stored or uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Passwords are generated locally in your browser. Nothing is sent to a server unless you explicitly export to a file on your device.",
        },
      },
      {
        "@type": "Question",
        name: "What is a passphrase and when should I use it?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A passphrase is a sequence of random words (e.g., Diceware). It can be easier to remember while still offering high entropy if you include enough words.",
        },
      },
      {
        "@type": "Question",
        name: "Can I enforce custom password policies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can require certain character classes and even use custom regex checks to ensure generated passwords meet your policy.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <PasswordGeneratorClient />
    </div>
  );
}
