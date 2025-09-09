"use client";

import { CloudUpload, type LucideIcon } from "lucide-react";
import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";

// Types
type ButtonVariant = "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

/** Base props shared across standalone & RHF modes */
type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  icon?: LucideIcon;
  label?: React.ReactNode;
  labelNode?: React.ReactNode;
  disable?: boolean;
  value?: string | number | boolean;
  defaultValue?: string | number | boolean;
  requiredMark?: boolean;
  hint?: React.ReactNode;
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

/** Props for generic + optional RHF name */
export type InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseProps & {
  name?: TName;
};

// Helpers
function toTextInputValue(v: unknown): string | number {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "1" : "";
  if (typeof v === "string" || typeof v === "number") return v;
  return "";
}

function makeSyntheticCheckboxChange(checked: boolean): React.ChangeEvent<HTMLInputElement> {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  const evt = new Event("change", { bubbles: true });
  Object.defineProperty(evt, "target", { writable: false, value: input });
  return evt as unknown as React.ChangeEvent<HTMLInputElement>;
}

// Component
export default function InputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  icon: LabelIcon,
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
  fileIcon: FileIcon,
  fileButtonLabel = "Import",
  fileButtonVariant = "outline",
  fileButtonSize = "default",
  ...rest
}: InputFieldProps<TFieldValues, TName>) {
  const effectiveDisabled = disabled ?? disable ?? false;
  const isFile = type === "file";
  const isCheckbox = type === "checkbox";
  const shouldParseNumber = !isCheckbox && (parseNumber ?? type === "number");
  const shouldPreventWheel = !isCheckbox && (preventWheelChange ?? shouldParseNumber);
  const labelContent = labelNode ?? label;

  const hiddenFileRef = React.useRef<HTMLInputElement | null>(null);
  const chooseFile = React.useCallback(() => {
    hiddenFileRef.current?.click();
  }, []);

  const [internal, setInternal] = React.useState<string | number | boolean | undefined>(
    defaultValue,
  );

  const inFormMode = Boolean(name);

  const toNumberIfNeeded = (raw: string): string | number => {
    if (!shouldParseNumber) return raw;
    return raw === "" ? "" : Number(raw);
  };

  const FileButtonIcon: LucideIcon = FileIcon ?? CloudUpload;

  if (inFormMode) {
    // RHF mode
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

          const handleChangeTextOrNumber = (e: ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            const val = toNumberIfNeeded(raw);
            rhfOnChange(val);
            onChange?.(e);
          };

          const assignRefs = (el: HTMLInputElement | null) => {
            hiddenFileRef.current = el;
            if (typeof fieldRef === "function") fieldRef(el);
            else if (
              fieldRef &&
              "current" in (fieldRef as React.MutableRefObject<HTMLInputElement | null>)
            ) {
              (fieldRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }
          };

          return (
            <FormItem className={className}>
              {!isCheckbox && labelContent ? (
                <FormLabel className="mb-2 inline-flex items-center gap-2" htmlFor={inputId}>
                  {LabelIcon ? <LabelIcon className="h-4 w-4" /> : null}
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
                      <FileButtonIcon className="h-4 w-4" />
                      {fileButtonLabel}
                    </Button>
                  </div>
                ) : isCheckbox ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={inputId}
                      checked={Boolean(fieldValue)}
                      onCheckedChange={(v) => rhfOnChange(Boolean(v))}
                      disabled={effectiveDisabled || field.disabled}
                    />
                    {labelContent ? (
                      <FormLabel htmlFor={inputId} className="cursor-pointer select-none">
                        {labelContent}
                        {requiredMark ? <span className="ml-0.5 text-destructive">*</span> : null}
                      </FormLabel>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 overflow-hidden rounded-md dark:bg-transparent">
                    <Input
                      id={inputId}
                      type={type}
                      placeholder={placeholder}
                      disabled={effectiveDisabled || field.disabled}
                      value={toTextInputValue(fieldValue)}
                      onChange={handleChangeTextOrNumber}
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

  // Standalone mode
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
    onChange?.(e);
  };

  const handleStandaloneCheckboxChange = (checked: boolean) => {
    if (!isControlled) setInternal(checked);
    if (onChange) onChange(makeSyntheticCheckboxChange(checked));
  };

  return (
    <div className={className}>
      {!isCheckbox && labelContent ? (
        <UiLabel className="mb-2 inline-flex items-center gap-2" htmlFor={inputId}>
          {LabelIcon ? <LabelIcon className="h-4 w-4" /> : null}
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
            <FileButtonIcon className="h-4 w-4" />
            {fileButtonLabel}
          </Button>
        </div>
      ) : isCheckbox ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={inputId}
            checked={Boolean(currentValue)}
            onCheckedChange={(v) => handleStandaloneCheckboxChange(Boolean(v))}
            disabled={effectiveDisabled}
          />
          {labelContent ? (
            <UiLabel htmlFor={inputId} className="cursor-pointer select-none">
              {labelContent}
              {requiredMark ? <span className="ml-0.5 text-destructive">*</span> : null}
            </UiLabel>
          ) : null}
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2 overflow-hidden rounded-md bg-light dark:bg-transparent">
          <Input
            id={inputId}
            type={type}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            value={toTextInputValue(currentValue)}
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