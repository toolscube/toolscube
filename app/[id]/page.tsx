import type { Metadata } from "next";
import { recordClickAndRedirect } from "@/lib/actions/shortener.action";
import { generateSEOMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generateSEOMetadata({
  title: "Redirecting...",
  description: "You are being redirected through Tools Cube's secure URL shortener.",
  noIndex: true,
});

export default async function ShortCatchAll({ params }: { params: { id: string } }) {
  const { id } = await params;
  await recordClickAndRedirect(id);
  return null;
}
