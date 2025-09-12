import JsonLd from "@/components/seo/json-ld";
import TodoOfflineClient from "@/components/tools/office/todo-offline-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "To-Do (Offline) • Tools Hub",
  description:
    "Local, private offline to-do list that works without internet. Add, organize, and track tasks securely in your browser. No signup required.",
  path: "/tools/office/todo",
  keywords: [
    "to-do list",
    "todo app",
    "offline to-do",
    "offline task manager",
    "task list app",
    "checklist app",
    "local only to-do",
    "privacy to-do list",
    "GTD app",
    "task tracker",
    "personal productivity tool",
    "daily planner offline",
    "simple task manager",
    "to-do with categories",
    "to-do with filters",
    "to-do with search",
    "priority tasks",
    "due dates to-do",
    "notes in to-do list",
    "progress stats",
    "export import tasks",
    "CSV to-do export",
    "JSON to-do export",
    "offline productivity app",
    "Tools Hub",
    "office tools",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/office/todo`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "To-Do (Offline) — Tools Hub",
    url: toolUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Fast, private offline to-do list. Add, edit, and organize tasks with categories, filters, and progress stats. Works entirely in your browser with no accounts or cloud sync.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Add, edit, delete tasks quickly",
      "Organize tasks by categories and filters",
      "Search and highlight tasks instantly",
      "Set task priorities and optional notes",
      "Due date support with progress stats",
      "Check/uncheck tasks with completion tracking",
      "Export tasks to CSV or JSON; import JSON later",
      "Print-friendly checklist mode",
      "Autosave to local storage with offline persistence",
      "No signup, no internet required — works 100% offline",
      "Privacy-first: all data stays in your browser",
      "Mobile-friendly responsive design",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "OrganizeAction",
      target: toolUrl,
      name: "Create an offline to-do list",
    },
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      { "@type": "ListItem", position: 2, name: "Office", item: `${siteURL}/tools#cat-office` },
      { "@type": "ListItem", position: 3, name: "To-Do (Offline)", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does this to-do app work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The app is fully offline-capable. Tasks are saved locally in your browser and do not require internet access.",
        },
      },
      {
        "@type": "Question",
        name: "Is my task data stored online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All tasks are stored locally in your browser. Nothing is uploaded, synced, or shared.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export and import my to-do list?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can export your tasks to CSV or JSON and import them back anytime.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support categories and priorities?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can organize tasks with categories, apply filters, and assign priorities for better tracking.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <TodoOfflineClient />
    </div>
  );
}
