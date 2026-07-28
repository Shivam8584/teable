import * as React from 'react';

import { cn } from '../utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border bg-background p-2 text-sm placeholder:text-muted-foreground hover:border-primary/30 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[color-mix(in_oklab,white_5%,hsl(var(--background)))]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
