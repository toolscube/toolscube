import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

type CopyOptions = { timeoutMs?: number };

export function useCopy(options: CopyOptions = {}) {
  const { timeoutMs = 1000 } = options;

  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => clearTimer, []);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text);
      setCopied(ok);
      if (ok) {
        clearTimer();
        timerRef.current = window.setTimeout(() => setCopied(false), timeoutMs);
      }
      return ok;
    },
    [timeoutMs],
  );

  return { copied, copy, reset };
}

export function useCopyKeyed<K extends string | number = string>(options: CopyOptions = {}) {
  const { timeoutMs = 1200 } = options;

  const [copiedKey, setCopiedKey] = useState<K | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => clearTimer, []);

  const reset = useCallback(() => {
    clearTimer();
    setCopiedKey(null);
  }, []);

  const copy = useCallback(
    async (text: string, key?: K) => {
      const ok = await copyToClipboard(text);
      if (!ok) return false;
      if (key !== undefined && key !== null) {
        setCopiedKey(key);
        clearTimer();
        timerRef.current = window.setTimeout(() => setCopiedKey(null), timeoutMs);
      }
      return true;
    },
    [timeoutMs],
  );

  return { copiedKey, copy, reset };
}
