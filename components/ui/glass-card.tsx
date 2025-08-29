'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, type MotionProps } from 'framer-motion';
import * as React from 'react';

type BaseProps = React.ComponentProps<typeof Card> & {
  sheen?: boolean;
  borderMuted?: boolean;
};

export function GlassCard({ className, sheen = true, borderMuted = true, children, ...props }: BaseProps) {
  return (
    <Card
      {...props}
      className={cn(
        'relative overflow-hidden',
        borderMuted ? 'border-muted/40' : '',
        // glass background
        'bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30',
        className,
      )}>
      {sheen && (
        <div className="pointer-events-none absolute inset-0 opacity-70">
          {/* soft gradient bevel */}
          <div className="absolute inset-[-1px] rounded-[inherit] bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
        </div>
      )}
      {children}
    </Card>
  );
}

type MotionGlassProps = BaseProps & MotionProps;

export function MotionGlassCard({ className, children, ...props }: MotionGlassProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <GlassCard className={className} {...props}>
        {children}
      </GlassCard>
    </motion.div>
  );
}
