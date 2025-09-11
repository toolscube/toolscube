"use client";
import * as React from "react";
import { useDropzone } from "react-dropzone";

export type LoadedImage = {
  file: File;
  url: string;
  width: number;
  height: number;
  type?: string;
  size?: number;
};

export function useImageInput(opts?: {
  onImage?: (img: LoadedImage) => void;
  acceptAll?: boolean;
  paste?: boolean;
}) {
  const { onImage, acceptAll = false, paste = true } = opts || {};
  const [img, setImg] = React.useState<LoadedImage | null>(null);

  const handleFile = React.useCallback(
    async (file?: File) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const meta = await loadImageMeta(url);
      const data: LoadedImage = {
        file,
        url,
        width: meta.width,
        height: meta.height,
        type: file.type,
        size: file.size,
      };
      setImg((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return data;
      });
      onImage?.(data);
    },
    [onImage],
  );

  const onDrop = React.useCallback((files: File[]) => handleFile(files?.[0]), [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptAll ? undefined : { "image/*": [] },
    multiple: false,
    onDrop,
  });

  React.useEffect(() => {
    if (!paste) return;
    function onPaste(e: ClipboardEvent) {
      const item = e.clipboardData?.files?.[0];
      if (!item) return;
      if (acceptAll || item.type.startsWith("image/")) handleFile(item);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [paste, acceptAll, handleFile]);

  React.useEffect(() => {
    return () => {
      if (img?.url) URL.revokeObjectURL(img.url);
    };
  }, [img]);

  return { img, setImg, getRootProps, getInputProps, isDragActive, handleFile };
}

export function loadImageMeta(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}
