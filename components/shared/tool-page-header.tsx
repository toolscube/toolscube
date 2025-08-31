import { GlassCard } from '@/components/ui/glass-card';
import { type LucideIcon } from 'lucide-react';

type ToolPageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
};

export default function ToolPageHeader({ title, description, icon: Icon, actions, className = '' }: ToolPageHeaderProps) {
  return (
    <GlassCard className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5 ${className}`}>
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {Icon ? <Icon className="h-6 w-6" /> : null}
          {title}
        </h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </GlassCard>
  );
}
