import JsonLd from "@/components/seo/json-ld";
import ApiTesterClient from "@/components/tools/dev/api-tester-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "API Request Tester",
  description:
    "Test REST & GraphQL API endpoints online — like a mini Postman. Send GET, POST, PUT, DELETE requests with headers, body, and auth. View JSON responses, status, and timing.",
  path: "/tools/dev/api-tester",
  keywords: [
    "API tester",
    "API request tester",
    "test API online",
    "REST client",
    "GraphQL client",
    "HTTP request tool",
    "mini Postman",
    "test endpoints",
    "send GET POST PUT DELETE",
    "API headers",
    "API auth",
    "JSON response viewer",
    "developer tools",
    "online API tester",
    "Tools Hub",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/api-tester`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "API Request Tester — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online API request tester — send GET, POST, PUT, DELETE requests with headers, body, and authentication. View responses in JSON, XML, or raw text with status codes and timing.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Send HTTP requests: GET, POST, PUT, PATCH, DELETE",
      "Supports REST and GraphQL endpoints",
      "Add custom headers, query params, and body (JSON, form, raw)",
      "Authentication options (Bearer, Basic, API key)",
      "JSON viewer with syntax highlighting",
      "View response status, headers, and timing",
      "Save and reuse requests",
      "Export/Import requests (JSON format)",
      "Dark/light mode",
      "Works fully in browser, privacy-first",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CommunicateAction",
      target: toolUrl,
      name: "Send API Request",
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
      { "@type": "ListItem", position: 3, name: "API Request Tester", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does this support GraphQL queries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can send GraphQL queries or mutations by selecting POST and providing a query body.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add headers or authentication?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can add any custom headers and choose authentication options like Bearer tokens, Basic Auth, or API keys.",
        },
      },
      {
        "@type": "Question",
        name: "Is my request data stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All requests are executed locally in your browser. Data is never stored on our servers.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <ApiTesterClient />
    </div>
  );
}
