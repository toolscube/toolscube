"use client";

import type { LucideIcon } from "lucide-react";
import InputField from "@/components/shared/form-fields/input-field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ColorFieldProps = {
  id?: string;
  icon?: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
};

export default function ColorField({
  id = "color",
  icon: Icon,
  value,
  onChange,
  label,
  className,
}: ColorFieldProps) {
  const normalizeHex = (v: string) => {
    const next = v.startsWith("#") ? v : `#${v}`;
    return next.slice(0, 7);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${id}-hex`} className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </Label>

      <div className="flex items-center gap-2">
        {/* Color picker */}
        <InputField
          id={`${id}-picker`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="m-0"
          inputClassName="h-10 w-10 cursor-pointer rounded-md border bg-transparent p-1"
        />

        {/* Hex input */}
        <InputField
          id={`${id}-hex`}
          type="text"
          placeholder="#000000"
          value={value}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          className="m-0 flex-1"
          inputClassName="font-mono"
        />
      </div>
    </div>
  );
}
