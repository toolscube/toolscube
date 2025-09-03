'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as React from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';

/** Types */
type Option = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
};

type BaseProps = {
  id?: string;

  label?: React.ReactNode;
  options: Option[];
  placeholder?: string;
  description?: React.ReactNode;

  /** Layout / styling */
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;

  /** Behavior */
  disabled?: boolean;
  required?: boolean;

  allowClear?: boolean;
  clearLabel?: string;

  /** Callbacks / value control */
  value?: string | number | undefined;
  onValueChange?: (value: string | number | undefined) => void;

  /** If provided in standalone mode */
  defaultValue?: string | number | undefined;

  valueAsNumber?: boolean;

  /** Error text for standalone mode */
  error?: React.ReactNode;
};

export type SelectFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = BaseProps & {
  /** If omitted, runs in standalone mode */
  name?: TName;
};

/** Implementation */

const CLEAR_TOKEN = '__CLEAR__';

function normalizeOut(raw: string, { valueAsNumber }: { valueAsNumber?: boolean }): string | number | undefined {
  if (raw === CLEAR_TOKEN) return undefined;
  if (!valueAsNumber) return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeIn(v: string | number | undefined | null): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export default function SelectField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  /** Common */
  name,
  id,
  label,
  options,
  placeholder = 'Select an option',
  description,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  required = false,
  allowClear = false,
  clearLabel = 'Clear',
  valueAsNumber = false,

  /** Controlled / Uncontrolled (standalone) */
  value: externalValue,
  onValueChange,
  defaultValue,
  error,
}: SelectFieldProps<TFieldValues, TName>) {
  const autoId = React.useId();
  const triggerId = id ?? autoId;

  /** Standalone branch */
  if (!name) {
    const [internal, setInternal] = React.useState<string | number | undefined>(defaultValue);
    const current = externalValue !== undefined ? externalValue : internal;
    const selectValue = normalizeIn(current);

    const handleChange = (raw: string) => {
      const next = normalizeOut(raw, { valueAsNumber });
      if (onValueChange) onValueChange(next);
      else setInternal(next);
    };

    return (
      <div className={className}>
        {label ? (
          <label htmlFor={triggerId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2">
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        ) : null}
        <div className="dark:bg-transparent overflow-hidden rounded-md">
          <Select value={selectValue} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger id={triggerId} className={cn('w-full', triggerClassName)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className={contentClassName}>
              {allowClear && <SelectItem value={CLEAR_TOKEN}>{clearLabel}</SelectItem>}
              {options.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {description ? <p className="text-[0.8rem] text-muted-foreground">{description}</p> : null}

        {error ? <p className="text-[0.8rem] font-medium text-destructive">{error}</p> : null}
      </div>
    );
  }

  /** react-hook-form branch */
  return (
    <FormField
      name={name}
      render={({ field }) => {
        const effectiveDisabled = disabled || field.disabled;
        const current = externalValue !== undefined ? externalValue : field.value ?? undefined;

        const selectValue = normalizeIn(current);

        const handleChange = (raw: string) => {
          const next = normalizeOut(raw, { valueAsNumber });
          field.onChange(next);
          onValueChange?.(next);
        };

        return (
          <FormItem className={className}>
            {label ? (
              <FormLabel className="mb-2" htmlFor={triggerId}>
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </FormLabel>
            ) : null}

            <FormControl>
              <div className="dark:bg-transparent overflow-hidden rounded-md">
                <Select value={selectValue} onValueChange={handleChange} disabled={effectiveDisabled}>
                  <SelectTrigger id={triggerId} className={cn('w-full', triggerClassName)}>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>

                  <SelectContent className={contentClassName}>
                    {allowClear && <SelectItem value={CLEAR_TOKEN}>{clearLabel}</SelectItem>}
                    {options.map((opt) => (
                      <SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>

            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
