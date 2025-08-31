import { type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/glass-card';

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
}

interface ToolsHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: Action[];
}

export default function ToolsHeader({ title, description, icon: Icon, actions = [] }: ToolsHeaderProps) {
  return (
    <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Icon className="h-6 w-6" />
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map(({ label, icon: ActionIcon, onClick, variant = 'default' }, i) => (
            <Button key={i} onClick={onClick} variant={variant} className="gap-2">
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {label}
            </Button>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
