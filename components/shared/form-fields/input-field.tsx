"use client";

import { CloudUpload, type LucideIcon } from "lucide-react";
import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";

type ButtonVariant = "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  name?: string;

  icon?: LucideIcon;
  label?: React.ReactNode;
  labelNode?: React.ReactNode;
  disable?: boolean;

  value?: string | number;
  defaultValue?: string | number;

  requiredMark?: boolean;
  hint?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: HTMLInputTypeAttribute;

  parseNumber?: boolean;
  preventWheelChange?: boolean;

  id?: string;
  className?: string;
  inputClassName?: string;

  multiple?: boolean;
  accept?: string;
  onFilesChange?: (files: File[] | null) => void;

  fileIcon?: LucideIcon;
  fileButtonLabel?: string;
  fileButtonVariant?: ButtonVariant;
  fileButtonSize?: ButtonSize;
};

export type InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseProps & {
  /** If omitted, runs in standalone mode */
  name?: TName;
};

export function InputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  icon: Icon,
  label,
  labelNode,
  placeholder,
  type = "text",
  disabled,
  disable,
  className,
  inputClassName,
  value,
  defaultValue,
  requiredMark,
  hint,
  onChange,
  id,
  parseNumber,
  preventWheelChange,
  multiple,
  accept,
  onFilesChange,

  // simple file UI
  fileIcon: FileIcon,
  fileButtonLabel = "Import",
  fileButtonVariant = "outline",
  fileButtonSize = "default",

  ...rest
}: InputFieldProps<TFieldValues, TName>) {
  // ── Derived flags
  const effectiveDisabled = disabled ?? disable ?? false;
  const isFile = type === "file";
  const shouldParseNumber = parseNumber ?? type === "number";
  const shouldPreventWheel = preventWheelChange ?? shouldParseNumber;
  const labelContent = labelNode ?? label;

  // ── Hooks (must be top-level, unconditional)
  const hiddenFileRef = React.useRef<HTMLInputElement | null>(null);
  const chooseFile = React.useCallback(() => hiddenFileRef.current?.click(), []);
  const [internal, setInternal] = React.useState<string | number | undefined>(defaultValue);

  // Standalone vs RHF
  const inFormMode = Boolean(name);

  // ── Helpers
  const toNumberIfNeeded = (raw: string): string | number => {
    if (!shouldParseNumber) return raw;
    return raw === "" ? "" : Number(raw);
  };

  const LeftFileIcon: LucideIcon = Icon ?? CloudUpload;

  if (inFormMode) {
    // ── RHF MODE
    return (
      <FormField
        name={name as TName}
        render={({ field }) => {
          const inputId = id ?? (name as string);
          const { value: fieldValue, onChange: rhfOnChange, ref: fieldRef, ...restField } = field;

          const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
            const fl = e.target.files;
            rhfOnChange(fl);
            onFilesChange?.(fl ? Array.from(fl) : null);
          };

          const handleChangeNonFile = (e: ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            const val = toNumberIfNeeded(raw);
            rhfOnChange(val);
            onChange?.(e);
          };

          // assign both RHF ref and our local ref
          const assignRefs = (el: HTMLInputElement | null) => {
            hiddenFileRef.current = el;
            if (typeof fieldRef === "function") {
              fieldRef(el);
            } else if (
              fieldRef &&
              "current" in (fieldRef as React.MutableRefObject<HTMLInputElement | null>)
            ) {
              (fieldRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }
          };

          return (
            <FormItem className={className}>
              {labelContent ? (
                <FormLabel className="mb-2 gap-2" htmlFor={inputId}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {labelContent}
                  {requiredMark ? <span className="ml-0.5 text-destructive">*</span> : null}
                </FormLabel>
              ) : null}

              <FormControl>
                {isFile ? (
                  <div className="flex items-center gap-2">
                    <input
                      id={inputId}
                      ref={assignRefs}
                      type="file"
                      className="hidden"
                      disabled={effectiveDisabled || field.disabled}
                      multiple={multiple}
                      accept={accept}
                      onChange={handleFileChange}
                      {...rest}
                    />
                    <Button
                      type="button"
                      variant={fileButtonVariant}
                      size={fileButtonSize}
                      onClick={chooseFile}
                      disabled={effectiveDisabled || field.disabled}
                      className="gap-2"
                    >
                      <LeftFileIcon className="w-4 h-4" />
                      {fileButtonLabel}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 overflow-hidden rounded-md dark:bg-transparent">
                    <Input
                      id={inputId}
                      type={type}
                      placeholder={placeholder}
                      disabled={effectiveDisabled || field.disabled}
                      value={fieldValue ?? ""}
                      onChange={handleChangeNonFile}
                      onWheel={
                        shouldPreventWheel
                          ? (e) => (e.currentTarget as HTMLInputElement).blur()
                          : undefined
                      }
                      className={inputClassName}
                      ref={fieldRef}
                      {...restField}
                      {...rest}
                    />
                  </div>
                )}
              </FormControl>

              {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  // ── STANDALONE MODE
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internal;

  const inputId =
    id ??
    (typeof label === "string" ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  const handleStandaloneChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value;
    const val = toNumberIfNeeded(raw);
    if (!isControlled) setInternal(val);
    onChange?.(e);
  };

  const handleStandaloneFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const fl = e.target.files;
    onFilesChange?.(fl ? Array.from(fl) : null);
  };

  return (
    <div className={className}>
      {labelContent ? (
        <UiLabel className="mb-2 gap-2" htmlFor={inputId}>
          {Icon && <Icon className="h-4 w-4" />}
          {labelContent}
          {requiredMark ? <span className="ml-0.5 text-destructive">*</span> : null}
        </UiLabel>
      ) : null}

      {isFile ? (
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            ref={hiddenFileRef}
            type="file"
            className="hidden"
            disabled={effectiveDisabled}
            multiple={multiple}
            accept={accept}
            onChange={handleStandaloneFileChange}
            {...rest}
          />
          <Button
            type="button"
            variant={fileButtonVariant}
            size={fileButtonSize}
            onClick={chooseFile}
            disabled={effectiveDisabled}
            className="gap-2"
          >
            <LeftFileIcon className="w-4 h-4" />
            {fileButtonLabel}
          </Button>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2 overflow-hidden rounded-md bg-light font-grotesk dark:bg-transparent">
          <Input
            id={inputId}
            type={type}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            value={currentValue ?? ""}
            onChange={handleStandaloneChange}
            onWheel={
              shouldPreventWheel ? (e) => (e.currentTarget as HTMLInputElement).blur() : undefined
            }
            className={inputClassName}
            {...rest}
          />
        </div>
      )}

      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
