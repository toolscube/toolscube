import JsonLd from "@/components/seo/json-ld";
import MarkdownPreviewerClient from "@/components/tools/dev/markdown-previewer-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Markdown Previewer",
  description:
    "Preview and convert Markdown to HTML instantly. Supports live preview, syntax highlighting, export to HTML/MD, and copy/share options.",
  path: "/tools/dev/markdown-previewer",
  keywords: [
    "markdown previewer",
    "markdown to HTML",
    "markdown converter",
    "preview markdown",
    "md to html online",
    "markdown live preview",
    "markdown editor",
    "markdown viewer",
    "syntax highlighting",
    "GitHub flavored markdown",
    "tables & code blocks",
    "math LaTeX markdown",
    "copy HTML",
    "export markdown",
    "download HTML",
    "offline markdown preview",
    "developer tools",
    "Tools Hub",
    "Bangladesh",
    "online tools",
    "free markdown preview",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/markdown-previewer`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Markdown Previewer — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online Markdown Previewer to instantly render Markdown into HTML. Supports GitHub Flavored Markdown, syntax highlighting, tables, math, export, and copy/share.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Live Markdown to HTML preview",
      "Supports GitHub Flavored Markdown (GFM)",
      "Tables, lists, headings, images, links",
      "Syntax highlighting for code blocks",
      "Math & LaTeX rendering (if enabled)",
      "Export to HTML or Markdown",
      "Copy rendered HTML or plain text",
      "Print/Save as PDF",
      "Mobile-friendly responsive design",
      "Offline support & local autosave",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ConvertAction",
      target: toolUrl,
      name: "Convert Markdown to HTML",
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
        name: "Developer",
        item: `${siteURL}/tools#cat-developer`,
      },
      { "@type": "ListItem", position: 3, name: "Markdown Previewer", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does this support GitHub Flavored Markdown?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the previewer fully supports GitHub Flavored Markdown (GFM), including tables, task lists, and fenced code blocks.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my previewed Markdown?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can export as HTML, copy rendered content, or download the original Markdown for later use.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the previewer works in your browser without needing a server. You can even use it offline with local autosave.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <MarkdownPreviewerClient />
    </div>
  );
}
