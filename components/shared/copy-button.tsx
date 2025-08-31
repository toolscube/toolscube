'use client';

import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import toast from 'react-hot-toast';

type Variant = 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';
type MaybePromise<T> = T | Promise<T>;
type GetText = string | (() => MaybePromise<string | null | undefined>);

export type CopyButtonProps = {
  /** String to copy, or a function that returns it (sync/async). */
  getText: GetText;

  /** Visuals */
  label?: string;
  copiedLabel?: string;
  leftIcon?: React.ReactNode;
  leftIconCopied?: React.ReactNode;

  /** Button props passthrough */
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;

  /** UX behavior */
  timeoutMs?: number;
  withToast?: boolean;
  toastText?: string;
  toastErrorText?: string;

  /** Events */
  onCopied?: (value: string) => void;
  onError?: (err: unknown) => void;
};

export function CopyButton({
  getText,
  label = 'Copy',
  copiedLabel = 'Copied',
  leftIcon,
  leftIconCopied,

  variant = 'outline',
  size = 'sm',
  className,
  disabled,
  title,
  'aria-label': ariaLabel,

  timeoutMs = 1000,
  withToast = true,
  toastText = 'Copied successfully!',
  toastErrorText = 'Copy failed',

  onCopied,
  onError,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  React.useEffect(() => clearTimer, []);

  const run = async () => {
    try {
      const raw = typeof getText === 'function' ? await (getText as () => MaybePromise<string | null | undefined>)() : (getText as string);
      const val = (raw ?? '').toString();
      if (!val) return;

      const ok = await copyToClipboard(val);
      if (ok) {
        setCopied(true);
        onCopied?.(val);
        if (withToast) toast.success(toastText);
        clearTimer();
        timerRef.current = window.setTimeout(() => setCopied(false), timeoutMs);
      } else {
        if (withToast) toast.error(toastErrorText);
      }
    } catch (err) {
      if (withToast) toast.error(toastErrorText);
      onError?.(err);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={run}
      disabled={disabled}
      className={cn('gap-2', className)}
      title={title}
      aria-label={ariaLabel || (copied ? copiedLabel : label)}
      aria-live="polite"
      data-copied={copied ? '' : undefined}>
      {copied ? leftIconCopied ?? <Check className="h-4 w-4" /> : leftIcon ?? <Copy className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
