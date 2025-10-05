import JsonLd from "@/components/seo/json-ld";
import LoremIpsumClient from "@/components/tools/dev/lorem-ipsum-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Lorem Ipsum Generator",
  description:
    "Generate filler Lorem Ipsum text for design, mockups, and testing. Customize paragraphs, sentences, words, or bytes. Free, fast, and copy-ready.",
  path: "/tools/dev/lorem-ipsum",
  keywords: [
    "lorem ipsum generator",
    "generate lorem ipsum",
    "dummy text",
    "placeholder text",
    "filler text",
    "random text generator",
    "mockup text",
    "design text filler",
    "paragraph generator",
    "sentence generator",
    "word generator",
    "byte generator",
    "latin text",
    "copy lorem ipsum",
    "export lorem ipsum",
    "developer tools",
    "Tools Cube",
    "Bangladesh",
    "online tools",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/lorem-ipsum`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lorem Ipsum Generator — Tools Cube",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free Lorem Ipsum generator. Create paragraphs, sentences, words, or bytes of placeholder text for UI mockups, wireframes, and testing.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Generate paragraphs, sentences, words, or bytes",
      "Classic Lorem Ipsum and custom dictionary modes",
      "Randomness toggle for more variety",
      "Copy to clipboard, download as TXT/JSON",
      "Batch export multiple sets",
      "Autosave last settings in local storage",
      "Lightweight, responsive, and mobile-friendly",
      "Works offline in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate Lorem Ipsum text",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Inputs",
        value: "Number of paragraphs, sentences, words, or bytes",
      },
      {
        "@type": "PropertyValue",
        name: "Outputs",
        value: "Formatted placeholder text ready to copy or export",
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
      { "@type": "ListItem", position: 3, name: "Lorem Ipsum Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Lorem Ipsum text?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lorem Ipsum is standard dummy text used by designers and developers as placeholder content in mockups and prototypes.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate specific amounts of text?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can specify the number of paragraphs, sentences, words, or even bytes to generate exactly the amount you need.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Lorem Ipsum generator works fully in your browser and does not require an internet connection after loading.",
        },
      },
      {
        "@type": "Question",
        name: "Is the generated text unique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can toggle randomness to get unique variations. By default, it generates standard Lorem Ipsum passages.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <LoremIpsumClient />
    </div>
  );
}
