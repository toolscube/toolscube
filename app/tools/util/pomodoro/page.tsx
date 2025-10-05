import JsonLd from "@/components/seo/json-ld";
import PomodoroFocusClient from "@/components/tools/util/pomodoro-focus-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pomodoro Focus Timer",
  description:
    "Boost productivity with the Pomodoro Timer. Work in focused 25/5 cycles, customize intervals, track session history, and stay distraction-free.",
  path: "/tools/util/pomodoro",
  keywords: [
    "Pomodoro timer",
    "Pomodoro focus",
    "focus timer",
    "productivity timer",
    "work break cycle",
    "Pomodoro study timer",
    "Pomodoro technique timer",
    "25 5 timer",
    "time management timer",
    "Pomodoro clock",
    "GTD timer",
    "deep work timer",
    "distraction free timer",
    "study timer online",
    "work session tracker",
    "time block timer",
    "Pomodoro planner",
    "remote work timer",
    "productivity tool",
    "auto start Pomodoro",
    "Pomodoro with sound",
    "Pomodoro with history",
    "Pomodoro with stats",
    "dark mode Pomodoro timer",
    "offline Pomodoro timer",
    "mobile Pomodoro timer",
    "Tools Cube",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/util/pomodoro`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pomodoro Focus Timer — Tools Cube",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "A clean, interactive Pomodoro timer with customizable work/break intervals, sound alerts, auto-start, and session history tracking to improve focus and productivity.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Customizable work and break durations (not just 25/5)",
      "Optional long breaks after a set number of sessions",
      "Auto-start next work or break session",
      "Sound notifications with multiple themes",
      "Visual progress ring with large timer display",
      "Session history tracking and stats overview",
      "Pause, skip, and reset controls",
      "Dark/light mode toggle",
      "Offline support (runs fully in your browser)",
      "Mobile-friendly responsive interface",
      "Export session history to CSV/JSON",
      "Privacy-first: no signup, no data stored",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "UseAction",
      target: toolUrl,
      name: "Start a Pomodoro session",
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
        name: "Utilities",
        item: `${siteURL}/tools#cat-utilities`,
      },
      { "@type": "ListItem", position: 3, name: "Pomodoro Focus", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Pomodoro Technique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Pomodoro Technique is a time management method that breaks work into intervals (usually 25 minutes) separated by short breaks. After 4 cycles, a longer break is taken.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize work and break intervals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can set custom work and break durations to suit your workflow, not just the standard 25/5 cycle.",
        },
      },
      {
        "@type": "Question",
        name: "Does the timer work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Pomodoro Focus timer runs entirely in your browser and works offline with autosave support.",
        },
      },
      {
        "@type": "Question",
        name: "Is my session history stored online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Session history is stored locally in your browser for privacy. You can export it to CSV/JSON if needed.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <PomodoroFocusClient />
    </div>
  );
}
