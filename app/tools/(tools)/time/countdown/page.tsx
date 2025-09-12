import JsonLd from "@/components/seo/json-ld";
import CountdownTimerClient from "@/components/tools/time/countdown-timer-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Countdown & Pomodoro Timer",
  description:
    "Create countdowns, Pomodoro cycles, and event timers. Multi-timer dashboard with sound alerts, recurring sessions, and offline support.",
  path: "/tools/time/countdown",
  keywords: [
    "countdown timer",
    "Pomodoro timer",
    "event timer",
    "productivity timer",
    "meeting timer",
    "study timer",
    "classroom timer",
    "interval timer",
    "stopwatch countdown",
    "alarm timer",
    "multiple timers dashboard",
    "Pomodoro technique timer",
    "recurring Pomodoro",
    "long break timer",
    "focus session timer",
    "timer with sound alerts",
    "fullscreen timer",
    "dark mode timer",
    "offline timer app",
    "local storage timer",
    "Tools Hub",
    "time tools",
    "utilities",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/time/countdown`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Countdown & Pomodoro Timer — Tools Hub",
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Start quick countdowns, recurring Pomodoro cycles, or event timers. Includes sound alerts, fullscreen mode, and offline support.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Create multiple timers (countdown, Pomodoro, event)",
      "Custom durations with presets (meeting, study, break)",
      "Pomodoro cycles with work/break intervals",
      "Optional long breaks after multiple sessions",
      "Fullscreen timer mode with progress animation",
      "Sound alerts and browser tab blinking",
      "Local save of all active timers",
      "Pause, skip, reset controls",
      "Dark/light mode toggle",
      "Mobile-friendly responsive design",
      "Export/import timer setups (JSON)",
      "Privacy-first: all data stored locally in your browser",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "UseAction",
      target: toolUrl,
      name: "Start a countdown or Pomodoro timer",
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
        name: "Date & Time",
        item: `${siteURL}/tools#cat-date-time`,
      },
      { "@type": "ListItem", position: 3, name: "Countdown & Pomodoro", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does this timer support the Pomodoro Technique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can set up Pomodoro cycles with customizable work and break durations, plus optional long breaks.",
        },
      },
      {
        "@type": "Question",
        name: "Can I run multiple timers at the same time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool supports a multi-timer dashboard where you can manage countdowns, Pomodoro sessions, and event timers simultaneously.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The timer runs entirely in your browser, saving timers locally so it works even without internet access.",
        },
      },
      {
        "@type": "Question",
        name: "Are there sound alerts for timers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can enable sound alerts and tab title blinking when a timer ends to avoid missing notifications.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <CountdownTimerClient />
    </div>
  );
}
