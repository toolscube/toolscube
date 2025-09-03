import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools — Tools Hub",
  description:
    "Browse all online utilities: URL shortener, PDF & image tools, text utilities, developer helpers, SEO tools, and calculators.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
