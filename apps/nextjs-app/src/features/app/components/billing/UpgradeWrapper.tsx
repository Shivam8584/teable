import type { BillingProductLevel } from '@teable/openapi';
import type { ReactElement } from 'react';
import { useBillingLevel } from '../../hooks/useBillingLevel';

interface IUpgradeWrapperRenderProps {
  badge: ReactElement | null;
  needsUpgrade: boolean;
  isCommunity: boolean;
  currentLevel?: BillingProductLevel;
}

interface IUpgradeWrapperProps {
  children?: ReactElement | ((props: IUpgradeWrapperRenderProps) => ReactElement);
  spaceId?: string;
  baseId?: string;
  targetBillingLevel?: BillingProductLevel;
  onUpgradeClick?: () => void;
}

/**
 * Paywall-free fork: nothing is plan-gated, so this wrapper renders its child
 * untouched — no upgrade badge, no click interception. The props are kept so
 * existing call sites (and upstream merges) stay unchanged.
 */
export const UpgradeWrapper: React.FC<IUpgradeWrapperProps> = ({ children }) => {
  const currentLevel = useBillingLevel({});

  if (typeof children === 'function') {
    return children({
      badge: null,
      needsUpgrade: false,
      isCommunity: false,
      currentLevel,
    });
  }

  return children ?? null;
};
