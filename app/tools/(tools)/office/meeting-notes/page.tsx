import JsonLd from "@/components/seo/json-ld";
import MeetingNotesClient from "@/components/tools/office/meeting-notes-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Meeting Notes • Tools Hub",
  description:
    "Take fast, structured meeting notes with timestamps, speakers, action items, and decisions. Export and share easily.",
  path: "/tools/office/meeting-notes",
  keywords: [
    "meeting notes",
    "notes template",
    "timestamped notes",
    "action items",
    "agenda",
    "decisions",
    "minutes",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Meeting Notes — Tools Hub",
    url: `${site}/tools/office/meeting-notes`,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description:
      "Timestamped meeting notes with speaker tags, agenda, decisions, and action items. Export to Markdown/CSV/JSON. Autosaves locally.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "One-click timestamped entries",
      "Speaker tags & sections",
      "Agenda, decisions, and action items (owner & due date)",
      "Search & filter",
      "Export Markdown/CSV/JSON",
      "Copy to clipboard & print",
      "Autosave to local storage",
      "Works offline (no signup)",
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
      <MeetingNotesClient />
    </div>
  );
}
