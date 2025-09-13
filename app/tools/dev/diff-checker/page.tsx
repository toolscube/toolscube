import JsonLd from "@/components/seo/json-ld";
import DiffCheckerClient from "@/components/tools/dev/diff-checker-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Diff Checker",
  description:
    "Compare two texts or files and see differences instantly. Side-by-side or inline view, word/char diffs, ignore whitespace/case, and export unified diff/patch.",
  path: "/tools/dev/diff-checker",
  keywords: [
    "diff checker",
    "text diff",
    "compare text",
    "file diff",
    "string diff",
    "unified diff",
    "patch file",
    "side-by-side diff",
    "inline diff",
    "word diff",
    "character diff",
    "line-by-line diff",
    "syntax highlighting",
    "ignore whitespace",
    "ignore case",
    "trim lines",
    "normalize line endings",
    "copy diff",
    "export diff",
    "download patch",
    "compare clipboard",
    "diff history",
    "local autosave",
    "developer tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/diff-checker`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Diff Checker — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online diff tool to compare two texts or files. Choose side-by-side or inline view, toggle word/char diffs, ignore whitespace/case, and export unified diff/patch.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Side-by-side and inline diff views",
      "Word-level and character-level diffs",
      "Ignore whitespace, ignore case, trim/normalize",
      "Syntax highlighting for common languages",
      "Diff summary: added, removed, changed lines",
      "Copy highlighted diff or plain output",
      "Export Unified Diff / .patch, CSV/JSON of changes",
      "Paste or upload files (drag & drop)",
      "Local autosave, history, and restore",
      "Mobile-friendly UI, dark/light mode",
      "Privacy-first: runs entirely in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CompareAction",
      target: toolUrl,
      name: "Compare two texts or files",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Inputs", value: "Text areas or uploaded files" },
      {
        "@type": "PropertyValue",
        name: "Outputs",
        value: "Side-by-side/inline diff, unified diff/patch",
      },
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
      { "@type": "ListItem", position: 3, name: "Diff Checker", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What’s the difference between side-by-side and inline diff?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Side-by-side shows original and changed text in two columns. Inline shows a single merged view with additions and deletions marked inline.",
        },
      },
      {
        "@type": "Question",
        name: "How do I ignore whitespace or case changes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enable the toggles for ‘Ignore whitespace’ and ‘Ignore case’. The diff will recalculate and hide insignificant differences.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export a unified diff or patch file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Use Export to download a standard Unified Diff (.patch) or export changes as CSV/JSON for reporting.",
        },
      },
      {
        "@type": "Question",
        name: "Is my content uploaded anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Comparisons run locally in your browser. Nothing is sent to a server unless you export to a file on your device.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <DiffCheckerClient />
    </div>
  );
}
