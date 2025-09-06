import JsonLd from "@/components/seo/json-ld";
import TodoOfflineClient from "@/components/tools/office/todo-offline-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "To-Do (Offline) • Tools Hub",
  description:
    "Local, private to-do list that works offline. No signup. Stores only in your browser.",
  path: "/tools/office/todo",
  keywords: [
    "to-do",
    "todo",
    "offline to-do",
    "task list",
    "checklist",
    "local only",
    "privacy",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "To-Do (Offline) — Tools Hub",
    url: `${site}/tools/office/todo`,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description:
      "Fast, privacy-first offline to-do list. Works entirely in your browser with local storage. No accounts or cloud sync.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Add, edit, delete tasks",
      "Categories & filters",
      "Search",
      "Priority & notes",
      "Progress stats",
      "Export CSV/JSON, import JSON",
      "Autosave to local storage",
      "Offline by default (no signup)",
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
      <TodoOfflineClient />
    </div>
  );
}
