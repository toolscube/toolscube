import JsonLd from "@/components/seo/json-ld";
import DistanceClient from "@/components/tools/travel/distance-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Distance & ETA • Tools Hub",
  description:
    "Calculate rough distance and estimated travel time between two or more map points. Supports driving, walking, cycling, and straight-line distances.",
  path: "/tools/travel/distance",
  keywords: [
    "distance calculator",
    "ETA calculator",
    "distance and time",
    "map distance calculator",
    "travel time calculator",
    "distance between cities",
    "distance between two points",
    "calculate ETA online",
    "driving distance calculator",
    "walking distance calculator",
    "cycling distance calculator",
    "straight line distance",
    "haversine formula distance",
    "multi-point distance calculator",
    "GPS coordinates distance",
    "latitude longitude distance",
    "route planning",
    "travel duration estimate",
    "map tools",
    "kilometers to miles",
    "miles to km",
    "Tools Hub",
    "travel tools",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/travel/distance`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Distance & ETA — Tools Hub",
    url: toolUrl,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Free online tool to calculate distance and estimated time of arrival (ETA) between map points. Supports multiple transport modes and GPS coordinates.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Calculate distance between two or more map points",
      "Supports driving, walking, cycling, and straight-line modes",
      "Enter locations by address, city, or GPS coordinates",
      "Supports kilometers (km) and miles (mi)",
      "Estimate travel time (ETA) with average speeds",
      "Add multiple waypoints for route planning",
      "Copy/share results easily",
      "Export results to CSV or JSON",
      "Mobile-friendly and responsive design",
      "Privacy-first: runs locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CalculateAction",
      target: toolUrl,
      name: "Calculate distance and ETA",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Travel", item: `${siteURL}/tools#cat-travel` },
      { "@type": "ListItem", position: 3, name: "Distance & ETA", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do you calculate distance between two points?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We calculate distance using either straight-line (Haversine formula) or route-based approximations depending on the mode you choose (driving, walking, cycling).",
        },
      },
      {
        "@type": "Question",
        name: "Can I estimate travel time (ETA)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. ETA is estimated based on average speeds for driving, walking, or cycling. For precise ETA, use GPS navigation apps.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool support multiple points?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can add multiple waypoints to calculate cumulative distance and travel time for route planning.",
        },
      },
      {
        "@type": "Question",
        name: "Is my location data stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All calculations are performed in your browser and not uploaded to a server, keeping your data private.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <DistanceClient />
    </div>
  );
}
