import { useMemo } from 'react';
import { calculateComplianceScore, getLicenseSummary } from '../utils/complianceScore';
import { PENALTY_RULES } from '../utils/penaltyRules';

export function useCompliance(licenses = []) {
  const scoreData = useMemo(() => calculateComplianceScore(licenses), [licenses]);
  const summary = useMemo(() => getLicenseSummary(licenses), [licenses]);

  const totalPenaltyExposure = useMemo(() => {
    let total = 0;
    for (const lic of licenses) {
      if (lic.daysLeft < 0) {
        const rule = PENALTY_RULES[lic.license_type];
        if (rule?.slabs?.length) {
          total += rule.slabs[rule.slabs.length - 1].fine;
        }
      }
    }
    return total;
  }, [licenses]);

  return { scoreData, summary, totalPenaltyExposure };
}
