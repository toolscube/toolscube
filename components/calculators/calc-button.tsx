'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as React from 'react';

type Props = React.ComponentProps<typeof Button> & {
  variantIntent?: 'primary' | 'accent' | 'danger' | 'ghost';
  grow?: boolean;
};

export function CalcButton({ className, variantIntent = 'ghost', grow, ...rest }: Props) {
  const intent =
    variantIntent === 'primary'
      ? 'bg-primary/20 hover:bg-primary/30 text-primary'
      : variantIntent === 'accent'
      ? 'bg-muted/60 hover:bg-muted/80 text-foreground'
      : variantIntent === 'danger'
      ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive'
      : 'bg-background/60 hover:bg-background/80 text-foreground';

  return <Button {...rest} className={cn('rounded-xl backdrop-blur transition-colors', intent, grow && 'col-span-2', className)} variant="outline" />;
}
