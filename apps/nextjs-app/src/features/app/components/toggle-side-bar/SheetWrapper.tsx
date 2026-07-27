import { ChevronsRight } from '@teable/icons';
import { Sheet, SheetContent, Button, SheetTrigger } from '@teable/ui-lib';
import { cn } from '@teable/ui-lib/shadcn';

interface SheetWrapperProps {
  children: React.ReactNode;
}

export const SheetWrapper = (props: SheetWrapperProps) => {
  const { children } = props;

  return (
    <Sheet modal={true}>
      <SheetTrigger asChild>
        <Button
          className={cn(
            'fixed left-0 top-[calc(var(--teable-top-banner-height)_+_1.75rem)] z-50 rounded-l-none rounded-r-full p-1 transition-all'
          )}
          size="icon-xs"
          variant={'outline'}
        >
          <ChevronsRight className="size-5 shrink-0" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0" closeable={false}>
        {children}
      </SheetContent>
    </Sheet>
  );
};
