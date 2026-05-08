import { useMemo } from 'react';
import { calculatePenalty } from '../utils/penaltyRules';

export function usePenalty(licenseType, daysLeft) {
  return useMemo(() => {
    const daysOverdue = daysLeft !== null ? -daysLeft : 0;
    return calculatePenalty(licenseType, Math.max(0, daysOverdue));
  }, [licenseType, daysLeft]);
}
