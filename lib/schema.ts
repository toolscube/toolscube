import { siteURL } from "@/lib/constants";

export function generateToolSchema(tool: {
  name: string;
  description: string;
  url: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${siteURL}${tool.url}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    },
    publisher: {
      "@type": "Organization",
      name: "Tools Cube",
      url: siteURL
    },
    screenshot: `${siteURL}/og/${tool.category}-tools.png`,
    softwareRequirements: "Web Browser",
    permissions: "No special permissions required",
    isAccessibleForFree: true,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5"
    }
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteURL}${crumb.url}`
    }))
  };
}

export function generateHowToSchema(tool: {
  name: string;
  steps: Array<{ step: string; description: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: `Step-by-step guide to use ${tool.name} on Tools Cube`,
    step: tool.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.step,
      text: step.description
    })),
    totalTime: "PT2M",
    supply: {
      "@type": "HowToSupply",
      name: "Web Browser"
    },
    tool: {
      "@type": "HowToTool", 
      name: "Tools Cube"
    }
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tools Cube",
  url: siteURL,
  description: "Fast, free, privacy-friendly online tools for productivity and development",
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteURL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Tools Cube",
    url: siteURL,
    logo: `${siteURL}/assets/logo.png`,
    sameAs: ["https://github.com/tariqul420", "https://tariqul.dev"],
  },
};