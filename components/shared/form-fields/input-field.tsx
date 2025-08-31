'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label as UiLabel } from '@/components/ui/label';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name?: string;
  label?: React.ReactNode;
  labelNode?: React.ReactNode;
  disable?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  requiredMark?: boolean;
  hint?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
  parseNumber?: boolean;
  preventWheelChange?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
}

export function InputField({
  name,
  label,
  labelNode,
  placeholder,
  type = 'text',
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
  ...rest
}: Props) {
  const effectiveDisabled = disabled ?? disable ?? false;
  const shouldParseNumber = parseNumber ?? type === 'number';
  const shouldPreventWheel = preventWheelChange ?? shouldParseNumber;

  // Detect RHF context safely
  let rhf: ReturnType<typeof useFormContext> | null = null;
  try {
    rhf = useFormContext();
  } catch {
    rhf = null;
  }

  const labelContent = labelNode ?? label;

  /* RHF mode */
  if (name && rhf) {
    return (
      <FormField
        name={name}
        render={({ field }) => {
          const { value: fv, onChange: formOnChange, ref, ...restField } = field;
          const inputId = id ?? name;
          return (
            <FormItem className={className}>
              {labelContent && (
                <FormLabel htmlFor={inputId}>
                  {labelContent}
                  {requiredMark ? <span className="text-destructive"> *</span> : null}
                </FormLabel>
              )}
              <FormControl>
                <div className="bg-light font-grotesk flex items-center gap-2 overflow-hidden rounded-md dark:bg-transparent">
                  <Input
                    id={inputId}
                    type={type}
                    placeholder={placeholder}
                    disabled={effectiveDisabled}
                    value={fv ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const val = shouldParseNumber ? (raw === '' ? '' : Number(raw)) : raw;
                      formOnChange(val);
                      onChange?.(e);
                    }}
                    onWheel={shouldPreventWheel ? (e) => (e.currentTarget as HTMLInputElement).blur() : undefined}
                    className={inputClassName}
                    ref={ref}
                    {...restField}
                    {...rest}
                  />
                </div>
              </FormControl>
              {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  /* Standalone mode */
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : internal;

  const inputId = id ?? (typeof label === 'string' ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const handleStandaloneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const val = shouldParseNumber ? (raw === '' ? '' : Number(raw)) : raw;
    if (!isControlled) setInternal(val as any);
    onChange?.(e);
  };

  return (
    <div className={className}>
      {labelContent && (
        <UiLabel htmlFor={inputId}>
          {labelContent}
          {requiredMark ? <span className="text-destructive"> *</span> : null}
        </UiLabel>
      )}
      <div className="bg-light font-grotesk mt-1 flex items-center gap-2 overflow-hidden rounded-md dark:bg-transparent">
        <Input
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={effectiveDisabled}
          value={(currentValue as any) ?? ''}
          onChange={handleStandaloneChange}
          onWheel={shouldPreventWheel ? (e) => (e.currentTarget as HTMLInputElement).blur() : undefined}
          className={inputClassName}
          {...rest}
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
    </div>
  );
}
