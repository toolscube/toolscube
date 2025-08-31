'use client';

import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils'; // if you have a classnames helper
import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import toast from 'react-hot-toast';

type Variant = 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

type GetText = string | (() => string | Promise<string>);

export type CopyButtonProps = {
  getText: GetText;
  label?: string;
  copiedLabel?: string;
  withToast?: boolean;
  toastText?: string;
  timeoutMs?: number;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  leftIconCopied?: React.ReactNode;
  onCopied?: (value: string) => void;
};

export function CopyButton({
  getText,
  label = 'Copy',
  copiedLabel = 'Copied',
  withToast = true,
  toastText = 'Copied Successfully!',
  timeoutMs = 1000,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
  leftIcon,
  leftIconCopied,
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const t = React.useRef<number | undefined>(undefined);

  const run = async () => {
    try {
      const val = typeof getText === 'function' ? await (getText as any)() : getText;
      if (!val) return;
      const ok = await copyToClipboard(val);
      if (ok) {
        setCopied(true);
        onCopied?.(val);
        if (withToast) toast.success(toastText);
        window.clearTimeout(t.current);
        t.current = window.setTimeout(() => setCopied(false), timeoutMs);
      } else {
        if (withToast) toast.error('Copy failed');
      }
    } catch {
      if (withToast) toast.error('Copy failed');
    }
  };

  return (
    <Button variant={variant} size={size} onClick={run} disabled={disabled} className={cn('gap-2', className)}>
      {copied ? leftIconCopied ?? <Check className="h-4 w-4" /> : leftIcon ?? <Copy className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
