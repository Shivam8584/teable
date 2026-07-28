import { cn } from '@teable/ui-lib/shadcn';
import type { FC } from 'react';

interface IEmptyStateIconProps {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  iconClassName?: string;
}

export const EmptyStateIcon: FC<IEmptyStateIconProps> = ({
  icon: Icon,
  className,
  iconClassName,
}) => (
  <div
    className={cn(
      'flex size-20 shrink-0 items-center justify-center rounded-2xl bg-muted',
      className
    )}
  >
    <Icon className={cn('size-9 text-muted-foreground', iconClassName)} />
  </div>
);
