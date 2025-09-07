"use client";

import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Intent = "primary" | "accent" | "danger" | "ghost";

type Props = React.ComponentProps<typeof Button> & {
  variantIntent?: Intent;
  grow?: boolean;
  hotkeyHint?: string;
};

export function CalcButton({
  className,
  variantIntent = "ghost",
  grow,
  hotkeyHint,
  children,
  title,
  ...rest
}: Props) {
  const intent =
    variantIntent === "primary"
      ? "bg-primary/20 hover:bg-primary/30 text-primary"
      : variantIntent === "accent"
        ? "bg-muted/60 hover:bg-muted/80 text-foreground"
        : variantIntent === "danger"
          ? "bg-destructive/20 hover:bg-destructive/30 text-destructive"
          : "bg-background/60 hover:bg-background/80 text-foreground";

  return (
    <Button
      {...rest}
      title={title}
      variant="outline"
      className={cn(
        "relative h-12 rounded-xl backdrop-blur transition-colors",
        intent,
        grow && "col-span-2",
        className,
      )}
    >
      {children}
      {hotkeyHint && (
        <span className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-muted-foreground">
          {hotkeyHint}
        </span>
      )}
    </Button>
  );
}
