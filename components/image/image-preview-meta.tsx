"use client";
import Image from "next/image";
import type * as React from "react";

export function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

export function ImagePreview({
  url,
  emptyNode,
}: {
  url?: string | null;
  emptyNode?: React.ReactNode;
}) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-lg border bg-muted/40">
      {url ? (
        <Image
          src={url}
          alt="preview"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      ) : (
        (emptyNode ?? null)
      )}
    </div>
  );
}
