'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { csvDownload, downloadBlob, downloadFromUrl, downloadText } from '@/lib/utils/download';
import { ArrowDownToLine, Check, Copy, Download, ExternalLink, FileDown, FileUp, Link as LinkIcon, RefreshCcw, Save } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import toast from 'react-hot-toast';

type Variant = 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';
type MaybePromise<T> = T | Promise<T>;
type GetText = string | (() => MaybePromise<string | null | undefined>);

export type CopyButtonProps = {
  getText: GetText;
  label?: string;
  copiedLabel?: string;
  leftIcon?: React.ReactNode;
  leftIconCopied?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
  timeoutMs?: number;
  withToast?: boolean;
  toastText?: string;
  toastErrorText?: string;
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
  size = 'default',
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

      const ok = await navigator.clipboard
        .writeText(val)
        .then(() => true)
        .catch(() => false);

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

export function ResetButton({
  onClick,
  label = 'Reset',
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: {
  onClick: () => void;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button variant={variant} size={size} onClick={onClick} disabled={disabled} className={cn('gap-2', className)}>
      <RefreshCcw className="h-4 w-4" /> {label}
    </Button>
  );
}

export function SaveButton({
  onClick,
  label = 'Save',
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: {
  onClick: () => void | Promise<void>;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button variant={variant} size={size} onClick={onClick} disabled={disabled} className={cn('gap-2', className)}>
      <Save className="h-4 w-4" /> {label}
    </Button>
  );
}

export function DownloadTextButton({
  filename,
  getText,
  label = 'Download',
  mime = 'text/plain;charset=utf-8;',
  variant = 'default',
  size = 'sm',
  className,
  disabled,
}: {
  filename: string;
  getText: () => MaybePromise<string>;
  label?: string;
  mime?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  const run = async () => {
    const text = await getText();
    downloadText(filename, text, mime);
  };
  return (
    <Button onClick={run} disabled={disabled} variant={variant} size={size} className={cn('gap-2', className)}>
      <ArrowDownToLine className="h-4 w-4" /> {label}
    </Button>
  );
}

export function DownloadBlobButton({
  filename,
  getBlob,
  label = 'Download',
  variant = 'default',
  size = 'sm',
  className,
  disabled,
}: {
  filename: string;
  getBlob: () => MaybePromise<Blob>;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  const run = async () => {
    const blob = await getBlob();
    downloadBlob(filename, blob);
  };
  return (
    <Button onClick={run} disabled={disabled} variant={variant} size={size} className={cn('gap-2', className)}>
      <FileDown className="h-4 w-4" /> {label}
    </Button>
  );
}

export function DownloadFromUrlButton({
  filename,
  url,
  label = 'Download',
  variant = 'default',
  size = 'sm',
  className,
  disabled,
}: {
  filename: string;
  url: string;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button onClick={() => downloadFromUrl(filename, url)} disabled={disabled} variant={variant} size={size} className={cn('gap-2', className)}>
      <Download className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportCSVButton({
  filename,
  getRows,
  label = 'Export CSV',
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: {
  filename: string;
  getRows: () => MaybePromise<(string | number)[][]>;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  const run = async () => {
    const rows = await getRows();
    csvDownload(filename, rows);
  };
  return (
    <Button variant={variant} size={size} onClick={run} disabled={disabled} className={cn('gap-2', className)}>
      <Download className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportFileButton({
  filename,
  getContent,
  mime = 'text/plain;charset=utf-8;',
  label = 'Export',
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: {
  filename: string;
  getContent: () => MaybePromise<string | Blob>;
  mime?: string;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  const run = async () => {
    const content = await getContent();
    if (typeof content === 'string') {
      downloadText(filename, content, mime);
    } else {
      downloadBlob(filename, content);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={run} disabled={disabled} className={cn('gap-2', className)}>
      <FileDown className="h-4 w-4" />
      {label}
    </Button>
  );
}

export function ImportFileButton({
  accept,
  multiple,
  onFiles,
  label = 'Import',
  variant = 'outline',
  size = 'default',
  className,
  disabled,
  children,
}: {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[] | null) => void;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const ref = React.useRef<HTMLInputElement | null>(null);
  const choose = () => ref.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const fl = e.target.files;
    onFiles(fl ? Array.from(fl) : null);
    if (ref.current) ref.current.value = '';
  };

  return (
    <>
      <input ref={ref} type="file" className="hidden" accept={accept} multiple={multiple} onChange={onChange} disabled={disabled} />
      <Button type="button" variant={variant} size={size} onClick={choose} disabled={disabled} className={cn('gap-2', className)}>
        <FileUp className="h-4 w-4" />
        {children ?? label}
      </Button>
    </>
  );
}

export function LinkButton({
  href,
  label,
  variant = 'outline',
  size = 'sm',
  className,
  leftIcon = <ExternalLink className="h-4 w-4" />,
}: {
  href: string;
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  leftIcon?: React.ReactNode;
}) {
  return (
    <Button variant={variant} size={size} className={cn('gap-2', className)}>
      <Link href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1">
        {leftIcon}
        {label}
      </Link>
    </Button>
  );
}

export function ActionButton({
  onClick,
  label,
  variant = 'default',
  size = 'sm',
  className,
  leftIcon = <LinkIcon className="h-4 w-4" />,
  disabled,
}: {
  onClick: () => void | Promise<void>;
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button onClick={onClick} disabled={disabled} variant={variant} size={size} className={cn('gap-2', className)}>
      {leftIcon}
      {label}
    </Button>
  );
}
