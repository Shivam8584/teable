import { LayoutGrid, Plus } from '@teable/icons';
import { useBasePermission } from '@teable/sdk/hooks';
import { Button } from '@teable/ui-lib/shadcn';
import { useTranslation } from 'next-i18next';
import { dashboardConfig } from '@/features/i18n/dashboard.config';
import { EmptyStateIcon } from '../components/EmptyStateIcon';
import { CreateDashboardDialog } from './components/CreateDashboardDialog';

export const EmptyDashboard = () => {
  const { t } = useTranslation(dashboardConfig.i18nNamespaces);

  const basePermissions = useBasePermission();
  const canManage = basePermissions?.['base|update'];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-20">
      <EmptyStateIcon icon={LayoutGrid} />
      <div className="text-center">
        <h3 className="mb-3 text-xl font-semibold text-foreground">{t('dashboard:empty.title')}</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          {t('dashboard:empty.description')}
        </p>
        {canManage && (
          <CreateDashboardDialog>
            <Button size="lg" className="px-8">
              <Plus className="size-4 shrink-0" /> {t('dashboard:empty.create')}
            </Button>
          </CreateDashboardDialog>
        )}
      </div>
    </div>
  );
};
