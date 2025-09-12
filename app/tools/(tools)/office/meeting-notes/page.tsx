import JsonLd from "@/components/seo/json-ld";
import MeetingNotesClient from "@/components/tools/office/meeting-notes-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Meeting Notes • Tools Hub",
  description:
    "Take structured meeting notes with timestamps, speakers, agendas, action items, and decisions. Export to Markdown, PDF, CSV, or JSON. Free, fast, and privacy-friendly.",
  path: "/tools/office/meeting-notes",
  keywords: [
    "meeting notes",
    "minutes of meeting",
    "MoM notes",
    "meeting minutes template",
    "structured meeting notes",
    "agenda notes",
    "action items tracker",
    "decision log",
    "timestamped notes",
    "project meeting notes",
    "team collaboration notes",
    "business meeting notes",
    "board meeting minutes",
    "one-on-one notes",
    "scrum meeting notes",
    "standup meeting notes",
    "export meeting notes PDF",
    "export meeting notes CSV",
    "export meeting notes JSON",
    "export meeting notes Markdown",
    "offline meeting notes",
    "search meeting notes",
    "filter notes",
    "speaker tags",
    "agenda management",
    "meeting notes generator",
    "productivity tools",
    "office tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/office/meeting-notes`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Meeting Notes — Tools Hub",
    url: toolUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Take fast, timestamped meeting notes with agenda, speaker tags, action items, and decisions. Export as Markdown, PDF, CSV, or JSON.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "One-click timestamped entries to capture discussions in real-time",
      "Speaker tags and custom sections for better organization",
      "Agenda tracking with decisions and action items (with owner & due date)",
      "Search, filter, and highlight notes quickly",
      "Export meeting notes to Markdown, PDF, CSV, or JSON",
      "Copy notes to clipboard & print in clean layout",
      "Autosave to local storage — no account required",
      "Offline-capable and privacy-friendly (data stays in your browser)",
      "Responsive UI optimized for mobile, tablet, and desktop",
      "Reusable templates for different meeting types (standup, 1:1, project, board)",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Take meeting notes",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Office", item: `${siteURL}/tools#cat-office` },
      { "@type": "ListItem", position: 3, name: "Meeting Notes", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I export meeting notes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Meeting notes can be exported to Markdown, PDF, CSV, or JSON, making them easy to share or archive.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool is offline-capable and works entirely in your browser. Notes are autosaved locally.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create different templates for meetings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can reuse templates for standups, project meetings, one-on-ones, or board meetings.",
        },
      },
      {
        "@type": "Question",
        name: "Is my meeting data stored on a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All data stays in your browser unless you choose to export it manually.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <MeetingNotesClient />
    </div>
  );
}
