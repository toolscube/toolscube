'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as React from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';

type Option = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
};

type BaseProps = {
  label?: React.ReactNode;
  options: Option[];
  placeholder?: string;
  description?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  onValueChange?: (value: string) => void;
  valueAsNumber?: boolean;
};

export type SelectFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = BaseProps & {
  name: TName;
};

export default function SelectField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  label,
  options,
  placeholder = 'Select an option',
  description,
  disabled = false,
  required = false,
  allowClear = false,
  clearLabel = 'Clear',
  className,
  triggerClassName,
  contentClassName,
  onValueChange,
  valueAsNumber = false,
}: SelectFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        const selectValue = field.value === undefined || field.value === null ? '' : String(field.value);

        const handleChange = (v: string) => {
          const next: any = valueAsNumber ? (v === '' ? undefined : Number(v)) : v === '' ? undefined : v;

          field.onChange(next);
          onValueChange?.(v);
        };

        return (
          <FormItem className={className}>
            {label ? (
              <FormLabel>
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </FormLabel>
            ) : null}

            <FormControl>
              <Select value={selectValue} onValueChange={handleChange} disabled={disabled || field.disabled}>
                <SelectTrigger className={triggerClassName ?? 'w-full'}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent className={contentClassName}>
                  {allowClear && <SelectItem value="">{clearLabel}</SelectItem>}
                  {options.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
