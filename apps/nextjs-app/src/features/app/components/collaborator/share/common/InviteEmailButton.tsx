import { useTranslation } from 'next-i18next';

export const InviteEmailButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('common');
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex h-9 cursor-pointer items-center rounded-md border border-input px-3 text-sm text-muted-foreground hover:bg-accent"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {t('invite.dialog.tabEmail')}
    </div>
  );
};
