'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label as UiLabel } from '@/components/ui/label';
import { Upload } from 'lucide-react';

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

type BaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> & {
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

  multiple?: boolean;
  accept?: string;
  onFilesChange?: (files: File[] | null) => void;

  fileIcon?: React.ReactNode;
  fileButtonLabel?: string;
  fileButtonVariant?: ButtonVariant;
  fileButtonSize?: ButtonSize;
};

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
  multiple,
  accept,
  onFilesChange,

  // simple file UI
  fileIcon,
  fileButtonLabel = 'Import',
  fileButtonVariant = 'outline',
  fileButtonSize = 'default',

  ...rest
}: BaseProps) {
  const effectiveDisabled = disabled ?? disable ?? false;
  const isFile = type === 'file';
  const shouldParseNumber = parseNumber ?? type === 'number';
  const shouldPreventWheel = preventWheelChange ?? shouldParseNumber;

  // RHF context (optional)
  let rhf: ReturnType<typeof useFormContext> | null = null;
  try {
    rhf = useFormContext();
  } catch {
    rhf = null;
  }

  const labelContent = labelNode ?? label;

  // File helpers (both modes)
  const [hasSelection, setHasSelection] = React.useState(false);
  const hiddenFileRef = React.useRef<HTMLInputElement | null>(null);
  const chooseFile = () => hiddenFileRef.current?.click();

  /* RHF MODE */
  if (name && rhf) {
    return (
      <FormField
        name={name}
        render={({ field }) => {
          const inputId = id ?? name;
          const { value: fv, onChange: rhfOnChange, ref, ...restField } = field;

          const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            const fl = e.target.files;
            setHasSelection(!!fl && fl.length > 0);
            rhfOnChange(fl as any);
            onFilesChange?.(fl ? Array.from(fl) : null);
          };

          const handleChangeNonFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            const raw = e.target.value;
            const val = shouldParseNumber ? (raw === '' ? '' : Number(raw)) : raw;
            rhfOnChange(val as any);
            onChange?.(e);
          };

          return (
            <FormItem className={className}>
              {labelContent ? (
                <FormLabel className="mb-2" htmlFor={inputId}>
                  {labelContent}
                  {requiredMark ? <span className="ml-0.5 text-destructive">*</span> : null}
                </FormLabel>
              ) : null}

              <FormControl>
                {isFile ? (
                  <div className="flex items-center gap-2">
                    <input
                      id={inputId}
                      ref={(el) => {
                        hiddenFileRef.current = el;
                        (ref as (instance: HTMLInputElement | null) => void | undefined)?.(el);
                      }}
                      type="file"
                      className="hidden"
                      disabled={effectiveDisabled || field.disabled}
                      multiple={multiple}
                      accept={accept}
                      onChange={handleFileChange}
                      {...rest}
                    />
                    <Button type="button" variant={fileButtonVariant} size={fileButtonSize} onClick={chooseFile} disabled={effectiveDisabled || field.disabled} className="gap-2">
                      {fileIcon ?? <Upload className="h-4 w-4" />}
                      {fileButtonLabel}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-light font-grotesk flex items-center gap-2 overflow-hidden rounded-md dark:bg-transparent">
                    <Input
                      id={inputId}
                      type={type}
                      placeholder={placeholder}
                      disabled={effectiveDisabled || field.disabled}
                      value={fv ?? ''}
                      onChange={handleChangeNonFile}
                      onWheel={shouldPreventWheel ? (e) => (e.currentTarget as HTMLInputElement).blur() : undefined}
                      className={inputClassName}
                      ref={ref}
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

  /** STANDALONE MODE */
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : internal;

  const inputId = id ?? (typeof label === 'string' ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const handleStandaloneChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value;
    const val = shouldParseNumber ? (raw === '' ? '' : Number(raw)) : raw;
    if (!isControlled) setInternal(val as any);
    onChange?.(e);
  };

  const handleStandaloneFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const fl = e.target.files;
    setHasSelection(!!fl && fl.length > 0);
    onFilesChange?.(fl ? Array.from(fl) : null);
  };

  return (
    <div className={className}>
      {labelContent ? (
        <UiLabel className="mb-2" htmlFor={inputId}>
          {labelContent}
          {requiredMark ? <span className="ml-0.5 text-destructive">*</span> : null}
        </UiLabel>
      ) : null}

      {isFile ? (
        <div className="flex items-center gap-2">
          <input id={inputId} ref={hiddenFileRef} type="file" className="hidden" disabled={effectiveDisabled} multiple={multiple} accept={accept} onChange={handleStandaloneFileChange} {...rest} />

          <Button type="button" variant={fileButtonVariant} size={fileButtonSize} onClick={chooseFile} disabled={effectiveDisabled} className="gap-2">
            {fileIcon ?? <Upload className="h-4 w-4" />}
            {fileButtonLabel}
          </Button>
        </div>
      ) : (
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
      )}

      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
