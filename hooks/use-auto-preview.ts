import * as React from "react";

type UseAutoPreviewResult = {
  previewUrl: string | null;
  previewSize: number | null;
  previewBusy: boolean;
  clearPreview: () => void;
};

export function useAutoPreview(
  deps: React.DependencyList,
  generate: () => Promise<Blob | null>,
  debounceMs = 350,
): UseAutoPreviewResult {
  const [url, setUrl] = React.useState<string | null>(null);
  const [size, setSize] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = React.useCallback(() => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setSize(null);
  }, [url]);

  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setBusy(true);
      try {
        const blob = await generate();
        clear();
        if (blob) {
          const u = URL.createObjectURL(blob);
          setUrl(u);
          setSize(blob.size);
        }
      } finally {
        setBusy(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, deps);

  React.useEffect(() => clear, []);

  return { previewUrl: url, previewSize: size, previewBusy: busy, clearPreview: clear };
}
