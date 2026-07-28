import type { IUsageVo } from '@teable/openapi';
import { BillingProductLevel } from '@teable/openapi';

/**
 * This fork runs without billing: every plan-gated capability is granted to
 * every base, regardless of edition. The usage endpoints only exist in the
 * hosted/enterprise backend, so instead of querying them we hand the UI a
 * fully unlocked entitlement set.
 */
export const FULL_ACCESS_USAGE: IUsageVo = {
  level: BillingProductLevel.Enterprise,
  limit: {
    maxRows: Infinity,
    maxSizeAttachments: Infinity,
    maxNumAutomationRuns: Infinity,
    maxNumDatabaseConnections: Infinity,
    maxRevisionHistoryDays: Infinity,
    maxAutomationHistoryDays: Infinity,
    maxNumSystemSendEmail: Infinity,
    apiRateLimit: Infinity,
    automationEnable: true,
    auditLogEnable: true,
    adminPanelEnable: true,
    rowColoringEnable: true,
    buttonFieldEnable: true,
    fieldAIEnable: true,
    userGroupEnable: true,
    advancedExtensionsEnable: true,
    advancedPermissionsEnable: true,
    passwordRestrictedSharesEnable: true,
    authenticationEnable: true,
    domainVerificationEnable: true,
    organizationEnable: true,
    chatAIEnable: true,
    appEnable: true,
    appHideBadgeEnable: true,
    customDomainEnable: true,
  },
};

export const useBaseUsage = (_props?: { disabled?: boolean }) => {
  return FULL_ACCESS_USAGE;
};

export const useBaseUsageWithLoading = (_props?: { disabled?: boolean }) => {
  return { baseUsage: FULL_ACCESS_USAGE, loading: false, isFetched: true };
};
