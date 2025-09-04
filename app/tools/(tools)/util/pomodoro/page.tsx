import JsonLd from "@/components/seo/json-ld";
import PomodoroFocusClient from "@/components/tools/util/pomodoro-focus-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pomodoro Focus • Tools Hub",
  description:
    "Boost productivity with the Pomodoro Timer. Work in focused intervals with auto-start breaks, sound alerts, and session history tracking.",
  path: "/tools/util/pomodoro",
  keywords: [
    "Pomodoro timer",
    "focus timer",
    "work break cycle",
    "productivity tool",
    "countdown timer",
    "Tools Hub",
  ],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pomodoro Focus — Tools Hub",
    url: `${site}/tools/util/pomodoro`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "A clean, interactive Pomodoro timer with work/break cycles, sound notifications, auto-start options, and session history to maximize focus.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Customizable work/break intervals",
      "Auto-start next session",
      "Sound notifications",
      "Progress ring and big timer",
      "Session history tracking",
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

      {/* Interactive client component */}
      <PomodoroFocusClient />
    </div>
  );
}
