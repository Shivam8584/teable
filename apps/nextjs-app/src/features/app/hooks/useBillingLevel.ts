import { BillingProductLevel } from '@teable/openapi';

/**
 * No paywall in this fork: every space/base is treated as the highest plan, so
 * plan-gated UI (see UpgradeWrapper) always renders unlocked.
 */
export const useBillingLevel = (_props: { spaceId?: string; baseId?: string }) => {
  return BillingProductLevel.Enterprise;
};
