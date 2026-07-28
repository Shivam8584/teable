import { Button, Card, CardContent } from '@teable/ui-lib/shadcn';
import Link from 'next/link';
import type { FC } from 'react';
import { TeableLogo } from '@/components/TeableLogo';
import { useBrand } from '@/features/app/hooks/useBrand';

export const Error: FC<{ message: string }> = (props) => {
  const { message } = props;
  const { brandName } = useBrand();

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex w-full items-center justify-center">
            <TeableLogo className="text-4xl" />
            <p className="ml-1 truncate text-4xl font-semibold">{brandName}</p>
          </div>
          <h1 className="scroll-m-20 text-lg tracking-tight text-muted-foreground">{message}</h1>
          <Button asChild className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
