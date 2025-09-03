import JsonLd from "@/components/seo/json-ld";
import ClipboardCleanerClient from "@/components/tools/util/clipboard-cleaner-client";

import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Clipboard Cleaner • Tools Hub",
  description:
    "Strip formatting and paste as plain text. Clean punctuation, spaces, emojis, URLs & more. Paste, clean, and copy in one click.",
  path: "/tools/util/clipboard-cleaner",
  keywords: [
    "clipboard cleaner",
    "plain text paste",
    "remove formatting",
    "strip emojis",
    "remove URLs",
    "clean text",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Clipboard Cleaner — Tools Hub",
    url: `${site}/tools/util/clipboard-cleaner`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Strip formatting and paste as plain text. Clean smart punctuation, spaces, emojis, and URLs with one click.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Paste & clean text instantly",
      "Remove formatting, URLs, emojis",
      "Fix smart quotes/dashes/ellipsis",
      "Auto-clean on paste option",
      "Copy/export cleaned text",
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

      {/* Interactive client component */}
      <ClipboardCleanerClient />
    </div>
  );
}
