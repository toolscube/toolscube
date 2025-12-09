import { ToolsData } from "@/data/tools";
import { env } from "@/lib/env";
import type { MetadataRoute } from "next";

const site = env.app.siteUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/tools",
    "/about",
    "/privacy",
    "/terms",
    "/sponsors",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: new URL(route, site).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.6,
  }));

  const toolEntries: MetadataRoute.Sitemap = ToolsData.flatMap((section) =>
    section.items.map((item) => ({
      url: new URL(item.url, site).toString(),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: item.popular ? 0.9 : 0.6,
    }))
  );

  return [...staticEntries, ...toolEntries];
}
