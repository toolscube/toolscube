"use client";

import { Upload } from "lucide-react";
import type * as React from "react";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { cn } from "@/lib/utils";

export function ImageDropzone(
  props: React.HTMLAttributes<HTMLDivElement> & {
    getRootProps: () => DropzoneRootProps;
    getInputProps: () => DropzoneInputProps;
    isDragActive: boolean;
    subtitle?: React.ReactNode;
  },
) {
  const { getRootProps, getInputProps, isDragActive, subtitle, className, ...rest } = props;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 transition",
        isDragActive ? "border-primary bg-primary/5" : "hover:bg-muted/40",
        className,
      )}
      {...rest}
    >
      <input {...getInputProps()} />
      <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium">Drop image here, or click to browse</p>
        <p className="text-xs text-muted-foreground">{subtitle ?? "PNG, JPEG, WEBP, GIF, SVG"}</p>
      </div>
    </div>
  );
}
