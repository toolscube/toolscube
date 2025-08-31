import { copyToClipboard } from '@/lib/clipboard';
import { useCallback, useRef, useState } from 'react';

export function useCopy(timeoutMs = 1000) {
  const [copied, setCopied] = useState(false);
  const t = useRef<number | undefined>(undefined);
  const clearLater = () => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setCopied(false), timeoutMs);
  };

  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    setCopied(ok);
    clearLater();
    return ok;
  }, []);

  return { copied, copy, reset: () => setCopied(false) };
}

export function useCopyKeyed<K extends string = string>(timeoutMs = 1200) {
  const [copiedKey, setCopiedKey] = useState<K | null>(null);
  const t = useRef<number | undefined>(undefined);

  const copy = useCallback(async (text: string, key?: K) => {
    const ok = await copyToClipboard(text);
    if (!ok) return false;
    if (key) {
      setCopiedKey(key);
      window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setCopiedKey(null), timeoutMs);
    }
    return true;
  }, []);

  return { copiedKey, copy, reset: () => setCopiedKey(null) };
}
