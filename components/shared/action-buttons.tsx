"use client";

import {
  Check,
  Clipboard,
  CloudDownload,
  Copy,
  Link2,
  type LucideIcon,
  RotateCcw,
  Save,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { csvDownload, downloadBlob, downloadFromUrl, downloadText } from "@/lib/utils/download";

type Variant = "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";
type MaybePromise<T> = T | Promise<T>;
type GetText = string | (() => MaybePromise<string | null | undefined>);

export type CopyButtonProps = {
  getText: GetText;
  label?: string;
  copiedLabel?: string;
  icon?: LucideIcon;
  iconCopied?: LucideIcon;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
  timeoutMs?: number;
  withToast?: boolean;
  toastText?: string;
  toastErrorText?: string;
  onCopied?: (value: string) => void;
  onError?: (err: unknown) => void;
  render?: (props: { onClick: () => void; copied: boolean }) => React.ReactNode;
};

export function CopyButton({
  getText,
  label = "Copy",
  copiedLabel = "Copied",
  icon: Icon,
  iconCopied: IconCopied,
  variant = "outline",
  size = "default",
  className,
  disabled,
  title,
  "aria-label": ariaLabel,
  timeoutMs = 1000,
  withToast = true,
  toastText = "Copied successfully!",
  toastErrorText = "Copy failed",
  onCopied,
  onError,
  render,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const run = async () => {
    try {
      const raw =
        typeof getText === "function"
          ? await (getText as () => MaybePromise<string | null | undefined>)()
          : (getText as string);

      const val = (raw ?? "").toString();
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

  if (render) {
    return <>{render({ onClick: run, copied })}</>;
  }

  const LeftIcon: LucideIcon = copied ? (IconCopied ?? Check) : (Icon ?? Copy);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={run}
      disabled={disabled}
      className={cn("gap-2", className)}
      title={title}
      aria-label={ariaLabel || (copied ? copiedLabel : label)}
      aria-live="polite"
      data-copied={copied ? "" : undefined}
    >
      <LeftIcon className="h-4 w-4" />
      {copied ? copiedLabel : label}
    </Button>
  );
}

export type PasteButtonProps = {
  // behavior
  mode?: "append" | "replace";
  smartNewline?: boolean;
  getExisting?: () => string;
  setValue?: (next: string) => void;
  onText?: (text: string) => void;

  // ui
  label?: string;
  pastedLabel?: string;
  icon?: LucideIcon;
  iconPasted?: LucideIcon;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;

  title?: string;
  "aria-label"?: string;

  // feedback
  withToast?: boolean;
  toastText?: string;
  toastErrorText?: string;
  timeoutMs?: number;

  // callbacks
  onPasted?: (nextValue: string, pastedText: string) => void;
  onError?: (err: unknown) => void;
};

export function PasteButton({
  // behavior
  mode = "append",
  smartNewline = true,
  getExisting,
  setValue,
  onText,

  // ui
  label = "Paste",
  pastedLabel = "Pasted",
  icon: Icon,
  iconPasted: IconPasted,
  variant = "outline",
  size = "default",
  className,
  disabled,

  // a11y
  title,
  "aria-label": ariaLabel,

  // feedback
  withToast = true,
  toastText = "Pasted from clipboard",
  toastErrorText = "Could not paste from clipboard",
  timeoutMs = 1000,

  // callbacks
  onPasted,
  onError,
}: PasteButtonProps) {
  const [done, setDone] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const run = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
        if (withToast) toast.error(toastErrorText);
        onError?.(new Error("Clipboard API not available"));
        return;
      }

      const text = await navigator.clipboard.readText();
      if (!text) {
        if (withToast) toast.error(toastErrorText);
        return;
      }

      // compute next value
      const prev = (getExisting?.() ?? "").toString();
      const next =
        mode === "replace"
          ? text
          : prev
            ? prev + (smartNewline && !prev.endsWith("\n") ? "\n" : "") + text
            : text;

      setValue?.(next);
      onText?.(text);
      onPasted?.(next, text);

      if (withToast) toast.success(toastText);
      setDone(true);
      clearTimer();
      timerRef.current = window.setTimeout(() => setDone(false), timeoutMs);
    } catch (err) {
      if (withToast) toast.error(toastErrorText);
      onError?.(err);
    }
  };

  const LeftIcon: LucideIcon = done ? (IconPasted ?? Check) : (Icon ?? Clipboard);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={run}
      disabled={disabled}
      className={cn("gap-2", className)}
      title={title}
      aria-label={ariaLabel || (done ? pastedLabel : label)}
      aria-live="polite"
      data-state={done ? "done" : "idle"}
    >
      <LeftIcon className="h-4 w-4" />
      {done ? pastedLabel : label}
    </Button>
  );
}

export function ResetButton({
  onClick,
  icon: Icon,
  label = "Reset",
  variant = "outline",
  size = "default",
  className,
  disabled,
}: {
  onClick: () => void;
  icon?: LucideIcon;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  const LeftIcon: LucideIcon = Icon ?? RotateCcw;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" /> {label}
    </Button>
  );
}

export function SaveButton({
  onClick,
  icon: Icon,
  label = "Save",
  variant = "outline",
  size = "default",
  className,
  disabled,
}: {
  onClick: () => void | Promise<void>;
  icon?: LucideIcon;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  const LeftIcon: LucideIcon = Icon ?? Save;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportTextButton({
  filename = "text.txt",
  getText,
  label = "Export TXT",
  mime = "text/plain;charset=utf-8;",
  variant = "outline",
  size = "default",
  className,
  disabled,
  icon: Icon,
}: {
  filename?: string;
  getText: () => MaybePromise<string>;
  label?: string;
  mime?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const run = async () => {
    const text = await getText();
    downloadText(filename, text, mime);
  };

  const LeftIcon: LucideIcon = Icon ?? CloudDownload;

  return (
    <Button
      onClick={run}
      disabled={disabled}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportBlobButton({
  filename,
  getBlob,
  label = "Export",
  variant = "outline",
  size = "default",
  className,
  disabled,
  icon: Icon,
}: {
  filename: string;
  getBlob: () => MaybePromise<Blob>;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const run = async () => {
    const blob = await getBlob();
    downloadBlob(filename, blob);
  };

  const LeftIcon: LucideIcon = Icon ?? CloudDownload;

  return (
    <Button
      onClick={run}
      disabled={disabled}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportFromUrlButton({
  filename,
  url,
  label = "Export",
  variant = "outline",
  size = "default",
  className,
  disabled,
  icon: Icon,
}: {
  filename: string;
  url: string;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const LeftIcon: LucideIcon = Icon ?? CloudDownload;

  return (
    <Button
      onClick={() => downloadFromUrl(filename, url)}
      disabled={disabled}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportCSVButton({
  filename = "download.csv",
  getRows,
  label = "Export CSV",
  variant = "outline",
  size = "default",
  className,
  disabled,
  icon: Icon,
}: {
  filename?: string;
  getRows: () => MaybePromise<(string | number)[][]>;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const run = async () => {
    const rows = await getRows();
    const strRows: string[][] = rows.map((r) => r.map((c) => String(c)));
    csvDownload(filename, strRows);
  };

  const LeftIcon: LucideIcon = Icon ?? CloudDownload;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={run}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" /> {label}
    </Button>
  );
}

export function ExportFileButton({
  filename,
  getContent,
  mime = "text/plain;charset=utf-8;",
  label = "Export",
  variant = "outline",
  size = "default",
  className,
  disabled,
  icon: Icon,
}: {
  filename: string;
  getContent: () => MaybePromise<string | Blob>;
  mime?: string;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const run = async () => {
    const content = await getContent();
    if (typeof content === "string") {
      downloadText(filename, content, mime);
    } else {
      downloadBlob(filename, content);
    }
  };

  const LeftIcon: LucideIcon = Icon ?? CloudDownload;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={run}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <LeftIcon className="h-4 w-4" />
      {label}
    </Button>
  );
}

type LinkButtonProps = {
  href?: string;
  label?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  icon?: LucideIcon;
  disabled?: boolean;
  fullWidth?: boolean;
  newTab?: boolean;
  external?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  download?: boolean | string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
  ariaLabel?: string;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

export function LinkButton({
  href,
  label = "Open",
  variant = "outline",
  size = "default",
  className,
  leftIcon,
  rightIcon,
  icon,
  disabled,
  fullWidth,
  newTab,
  external,
  target,
  rel,
  download,
  prefetch,
  replace,
  scroll,
  shallow,
  locale,
  ariaLabel,
  title,
  onClick,
}: LinkButtonProps) {
  const LeftIcon: LucideIcon | undefined = leftIcon ?? icon ?? Link2;
  const RightIcon: LucideIcon | undefined = rightIcon;
  const isDisabled = disabled || !href;

  const content = (
    <>
      {LeftIcon ? <LeftIcon className="h-4 w-4" /> : null}
      {label}
      {RightIcon ? <RightIcon className="h-4 w-4" /> : null}
    </>
  );

  if (isDisabled) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled
        aria-disabled="true"
        title={title}
        className={cn("gap-2", fullWidth && "w-full", className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className="inline-flex items-center gap-2">{content}</span>
      </Button>
    );
  }

  const finalTarget = target ?? (newTab || external ? "_blank" : undefined);
  const finalRel = rel ?? (finalTarget === "_blank" ? "noopener noreferrer" : undefined);

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn("gap-2", fullWidth && "w-full", className)}
      title={title}
    >
      <Link
        href={href}
        target={finalTarget}
        rel={finalRel}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        locale={locale}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        download={download === true ? "" : download || undefined}
        onClick={onClick}
      >
        {content}
      </Link>
    </Button>
  );
}

export function ActionButton({
  type = "button",
  onClick,
  label,
  variant = "outline",
  size = "default",
  className,
  icon: Icon,
  disabled,
}: {
  onClick?: () => void | Promise<void>;
  label?: string;
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Button>
  );
}
