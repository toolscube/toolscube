import JsonLd from "@/components/seo/json-ld";
import ClipboardCleanerClient from "@/components/tools/util/clipboard-cleaner-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Clipboard Cleaner",
  description:
    "Clean your clipboard instantly. Strip formatting, remove emojis, links, and hidden characters. Paste as plain text and copy/export with one click.",
  path: "/tools/util/clipboard-cleaner",
  keywords: [
    "clipboard cleaner",
    "plain text paste",
    "paste without formatting",
    "remove formatting",
    "strip HTML clipboard",
    "strip emojis clipboard",
    "remove URLs clipboard",
    "clean clipboard text",
    "clear clipboard formatting",
    "productivity tools",
    "text cleaner clipboard",
    "auto clean paste",
    "clipboard manager alternative",
    "copy paste cleaner",
    "clipboard sanitizer",
    "sanitize text online",
    "remove smart quotes",
    "fix dashes ellipsis",
    "strip markdown clipboard",
    "convert rich text to plain text",
    "export clipboard text",
    "Tools Cube",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/util/clipboard-cleaner`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Clipboard Cleaner — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Strip formatting, emojis, links, and unwanted characters from your clipboard text. Paste clean, copy instantly, and export results.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Paste and clean text instantly",
      "Remove formatting, fonts, and styles",
      "Strip emojis, links, and hidden characters",
      "Fix smart punctuation (quotes, dashes, ellipsis)",
      "Remove HTML tags and decode entities",
      "Auto-clean on paste toggle",
      "Copy cleaned text back to clipboard",
      "Export cleaned text to TXT or copy directly",
      "Case transforms (UPPER, lower, Title Case) — optional",
      "Lightweight, privacy-first (runs in your browser)",
      "Mobile-friendly and responsive design",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "OrganizeAction",
      target: toolUrl,
      name: "Clean clipboard text",
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
        name: "Utilities",
        item: `${siteURL}/tools#cat-utilities`,
      },
      { "@type": "ListItem", position: 3, name: "Clipboard Cleaner", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does the Clipboard Cleaner do?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Clipboard Cleaner removes formatting, emojis, URLs, HTML tags, and other unwanted characters from your copied text. It outputs plain text you can paste anywhere.",
        },
      },
      {
        "@type": "Question",
        name: "Can it auto-clean when I paste?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enable auto-clean to automatically strip formatting as soon as you paste content into the tool.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support exporting cleaned text?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can copy the cleaned text back to clipboard or export it as a TXT file.",
        },
      },
      {
        "@type": "Question",
        name: "Is my clipboard data stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The tool works locally in your browser. Clipboard text is never uploaded or stored on a server.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <ClipboardCleanerClient />
    </div>
  );
}
