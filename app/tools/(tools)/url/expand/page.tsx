import JsonLd from "@/components/seo/json-ld";
import LinkExpandClient from "@/components/tools/url/link-expand-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Link Expander • Tools Hub",
  description:
    "Unshorten links, trace the full redirect chain (301/302), preview Open Graph data, and safely inspect the final destination—works with t.co, bit.ly, TinyURL, and more.",
  path: "/tools/url/expand",
  keywords: [
    "link expander",
    "expand URL",
    "unshorten URL",
    "unshorten link",
    "URL unshortener",
    "redirect chain checker",
    "trace redirects",
    "HTTP redirects 301 302",
    "final destination URL",
    "safe link preview",
    "Open Graph preview",
    "OG meta preview",
    "URL inspection",
    "URL analyzer",
    "URL checker",
    "check shortened link",
    "detect phishing links",
    "malware risk check (preview)",
    "t.co expander",
    "bit.ly expander",
    "tinyurl expander",
    "is.gd expander",
    "rebrandly expander",
    "goo.gl expander",
    "buff.ly expander",
    "ow.ly expander",
    "redirect hops",
    "URL headers preview",
    "HTTP status codes",
    "canonical URL inspector",
    "meta tags preview",
    "Twitter Card preview",
    "link safety preview",
    "no redirect open",
    "privacy-first link expand",
    "Tools Hub",
    "Bangladesh",
    "online tools",
    "free tools",
    "privacy friendly tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/url/expand`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Link Expander — Tools Hub",
    alternateName: [
      "URL Unshortener",
      "Redirect Chain Checker",
      "Safe Link Preview",
      "URL Inspector",
    ],
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Expand shortened links, see the full redirect chain (301/302), and preview OG/Twitter meta without visiting the final page. Fast, secure, and free.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Expand shortened URLs (t.co, bit.ly, TinyURL, is.gd, goo.gl, buff.ly, ow.ly, Rebrandly)",
      "Trace full redirect chain with HTTP status codes",
      "Preview Open Graph & Twitter Card metadata",
      "Detect known shorteners & show intermediate hops",
      "Privacy-first: expand without opening the link",
      "Copy final URL and export history as CSV",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "ViewAction",
      target: toolUrl,
      name: "Expand and inspect a shortened URL",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Tools",
        item: `${siteURL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "URL",
        item: `${siteURL}/tools/url`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Link Expander",
        item: toolUrl,
      },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which shorteners are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common shorteners like t.co, bit.ly, TinyURL, is.gd, Rebrandly, goo.gl, buff.ly, and ow.ly are supported. Many others work as long as they use standard HTTP redirects.",
        },
      },
      {
        "@type": "Question",
        name: "Is it safe and privacy-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool expands links and previews metadata without opening the final page in your browser, helping you inspect destinations before visiting.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my expansion history?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can export your recent expansions as a CSV file for auditing or sharing.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />
      <LinkExpandClient />
    </div>
  );
}
