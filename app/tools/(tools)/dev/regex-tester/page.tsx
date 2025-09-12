import JsonLd from "@/components/seo/json-ld";
import RegexTesterClient from "@/components/tools/dev/regex-tester-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Regex Tester",
  description:
    "Test and debug regular expressions online. Supports flags, match highlighting, groups, replacements, and validation for JavaScript, PCRE, and more.",
  path: "/tools/dev/regex-tester",
  keywords: [
    "regex tester",
    "regular expression tester",
    "regex online",
    "regex debug",
    "regex tool",
    "regex editor",
    "regex playground",
    "regex with flags",
    "regex groups",
    "regex match highlight",
    "regex replacement",
    "regex validation",
    "regex multiline",
    "regex global",
    "regex case insensitive",
    "regex lookahead lookbehind",
    "regex anchors",
    "regex quantifiers",
    "regex alternation",
    "regex capture groups",
    "regex test strings",
    "JavaScript regex",
    "TypeScript regex",
    "PCRE regex",
    "Python regex",
    "PHP regex",
    "Rust regex",
    "C# regex",
    "Java regex",
    "email regex",
    "URL regex",
    "phone number regex",
    "date regex",
    "password regex",
    "custom regex pattern",
    "Tools Hub",
    "online tools",
    "privacy friendly tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/regex-tester`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Regex Tester — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online regex tester for developers. Write, debug, and test regular expressions with real-time highlighting, groups, replacements, and validation.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Real-time regex testing with instant match highlighting",
      "Supports flags: global (g), multiline (m), case-insensitive (i), dotAll (s), unicode (u), sticky (y)",
      "Highlight capture groups and show match details",
      "Search & replace with regex substitutions",
      "Validation for common patterns (email, URL, phone, date, password)",
      "Supports JavaScript (ECMAScript), PCRE, and compatible flavors",
      "Regex library snippets for common use cases",
      "Copy regex pattern & matches easily",
      "Save and load regex test cases",
      "Mobile-friendly UI, dark mode supported",
      "Privacy-first: everything runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "UseAction",
      target: toolUrl,
      name: "Test a regular expression",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Developer", item: `${siteURL}/tools/dev` },
      { "@type": "ListItem", position: 3, name: "Regex Tester", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a Regex Tester?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Regex Tester is an online tool that allows you to write, test, and debug regular expressions in real-time. It highlights matches, groups, and replacements instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Which regex flavors are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool supports JavaScript (ECMAScript) regex, with many patterns also compatible with PCRE, Python, PHP, C#, and Java.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use regex for replacements?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can test regex-based replacements and preview transformed text instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Is my input text stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs locally in your browser, ensuring your test text and regex patterns remain private.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <RegexTesterClient />
    </div>
  );
}
