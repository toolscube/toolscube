import JsonLd from "@/components/seo/json-ld";
import CountdownTimerClient from "@/components/tools/time/countdown-timer-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Countdown & Pomodoro • Tools Hub",
  description:
    "Create quick countdowns, Pomodoro cycles, or event timers. Local save, sound alerts, and a clean multi-timer dashboard.",
  path: "/tools/time/countdown",
  keywords: ["countdown", "timer", "pomodoro", "event timer", "productivity", "Tools Hub"],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Countdown & Pomodoro — Tools Hub",
    url: `${site}/tools/time/countdown`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Start quick timers, Pomodoro sets, or countdown to a date/time. Lightweight, local-first, and delightful to use.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Pomodoro phases",
      "Meeting presets",
      "Event countdown",
      "Sound + title blink",
      "Local save",
    ],
    creator: {
      "@type": "Personal",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <CountdownTimerClient />
    </div>
  );
}
