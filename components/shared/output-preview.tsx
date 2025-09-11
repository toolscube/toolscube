// components/shared/output-preview.tsx
"use client";

import { Image as ImageIcon } from "lucide-react";
import type * as React from "react";
import { InfoPill } from "@/components/image/image-preview-meta";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { formatBytes } from "@/lib/canvas";

export function OutputPreview(props: {
  title?: string;
  description?: string;
  previewUrl: string | null;
  size: number | null;
  formatLabel: string;
  tips?: React.ReactNode;
  checker?: boolean;
}) {
  const {
    title = "Output Preview",
    description = "Live preview of converted image.",
    previewUrl,
    size,
    formatLabel,
    tips,
    checker = true,
  } = props;

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={
            checker
              ? "relative h-44 w-full overflow-hidden rounded border p-2 bg-[linear-gradient(45deg,#00000011_25%,transparent_25%),linear-gradient(-45deg,#00000011_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#00000011_75%),linear-gradient(-45deg,transparent_75%,#00000011_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]"
              : "relative h-44 w-full overflow-hidden rounded border p-2"
          }
        >
          {!previewUrl ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <ImageIcon className="mr-2 h-4 w-4" />
              No preview yet
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="preview" className="h-full w-full object-contain" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <InfoPill label="Output Size" value={size ? formatBytes(size) : "—"} />
          <InfoPill label="Format" value={formatLabel} />
        </div>

        {tips && <div className="text-xs text-muted-foreground">{tips}</div>}
      </CardContent>
    </GlassCard>
  );
}
