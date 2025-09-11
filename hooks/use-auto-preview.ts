// hooks/use-auto-preview.ts
import * as React from "react";

export function useAutoPreview<T extends any[]>(
  deps: T,
  generate: () => Promise<Blob | null>,
  debounceMs = 350,
) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [size, setSize] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const timerRef = React.useRef<any>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  React.useEffect(() => clear, []); // revoke on unmount

  return { previewUrl: url, previewSize: size, previewBusy: busy, clearPreview: clear };
}
