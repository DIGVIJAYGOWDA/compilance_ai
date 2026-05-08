export const PENALTY_RULES = {
  FSSAI: {
    name: 'FSSAI Food License',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 5000, consequence: 'Warning notice issued' },
      { days_overdue: 7, fine: 10000, consequence: 'Show cause notice' },
      { days_overdue: 30, fine: 25000, consequence: 'Operations may be suspended' },
      { days_overdue: 90, fine: 100000, consequence: 'License cancellation proceedings' },
      { days_overdue: 180, fine: 500000, consequence: 'Criminal prosecution under FSS Act 2006' },
    ],
    legal_reference: 'Food Safety and Standards Act, 2006 — Section 63',
  },
  FIRE_NOC: {
    name: 'Fire NOC',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 2000, consequence: 'Warning notice' },
      { days_overdue: 15, fine: 8000, consequence: 'Show cause notice' },
      { days_overdue: 30, fine: 20000, consequence: 'Closure notice possible' },
      { days_overdue: 60, fine: 50000, consequence: 'Forced closure order' },
      { days_overdue: 90, fine: 100000, consequence: 'Criminal proceedings' },
    ],
    legal_reference: 'Karnataka Fire Force Act, 1964',
  },
  TRADE_LICENSE: {
    name: 'Trade License',
    grace_days: 30,
    slabs: [
      { days_overdue: 1, fine: 1000, consequence: 'Late fee applied' },
      { days_overdue: 30, fine: 5000, consequence: 'Penalty notice' },
      { days_overdue: 90, fine: 15000, consequence: 'License suspension' },
      { days_overdue: 180, fine: 30000, consequence: 'Business sealing order' },
    ],
    legal_reference: 'BBMP Act, 1976',
  },
  SHOP_ESTABLISHMENT: {
    name: 'Shop & Establishment',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 1000, consequence: 'Fine issued' },
      { days_overdue: 30, fine: 5000, consequence: 'Labour inspector notice' },
      { days_overdue: 90, fine: 20000, consequence: 'Prosecution under Labour Act' },
    ],
    legal_reference: 'Karnataka Shops and Commercial Establishments Act, 1961',
  },
  EATING_HOUSE: {
    name: 'Eating House License',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 2000, consequence: 'Police notice' },
      { days_overdue: 30, fine: 10000, consequence: 'Show cause notice' },
      { days_overdue: 60, fine: 25000, consequence: 'Closure order by police' },
      { days_overdue: 180, fine: 50000, consequence: 'Criminal proceedings under IPC' },
    ],
    legal_reference: 'Karnataka Police Act, 1963',
  },
  GST: {
    name: 'GST Registration',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 200, consequence: 'Late fee per day (CGST+SGST)' },
      { days_overdue: 30, fine: 5000, consequence: 'Show cause notice' },
      { days_overdue: 90, fine: 25000, consequence: 'GST registration cancellation' },
    ],
    legal_reference: 'Central Goods and Services Tax Act, 2017 — Section 47',
  },
  SIGNAGE: {
    name: 'Signage / Hoarding License',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 500, consequence: 'Notice from BBMP advertisement dept' },
      { days_overdue: 30, fine: 3000, consequence: 'Penalty imposed' },
      { days_overdue: 60, fine: 10000, consequence: 'Signage removal order' },
    ],
    legal_reference: 'BBMP Act, 1976 — Advertisement Regulations',
  },
  DRUG_LICENSE: {
    name: 'Drug License',
    grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 5000, consequence: 'Warning notice' },
      { days_overdue: 30, fine: 20000, consequence: 'Show cause notice' },
      { days_overdue: 60, fine: 50000, consequence: 'Operations suspended' },
      { days_overdue: 90, fine: 200000, consequence: 'Criminal prosecution under Drugs Act' },
    ],
    legal_reference: 'Drugs and Cosmetics Act, 1940',
  },
};

/**
 * Returns current fine, consequence, projections, dailyCost, legalReference
 * @param {string} licenseType - e.g. 'FSSAI'
 * @param {number} daysOverdue - negative means not yet overdue
 */
export function calculatePenalty(licenseType, daysOverdue) {
  const rule = PENALTY_RULES[licenseType];
  if (!rule) {
    return { currentFine: 0, currentConsequence: 'No penalty data available', projections: [], dailyCost: 0, legalReference: '' };
  }

  const effectiveDays = Math.max(0, daysOverdue - rule.grace_days);
  const slabs = rule.slabs;

  const getCurrentSlab = (days) => {
    if (days <= 0) return null;
    let currentSlab = slabs[0];
    for (const slab of slabs) {
      if (days >= slab.days_overdue) {
        currentSlab = slab;
      }
    }
    return currentSlab;
  };

  const current = getCurrentSlab(effectiveDays);
  const p7 = getCurrentSlab(Math.max(effectiveDays, 7));
  const p30 = getCurrentSlab(Math.max(effectiveDays, 30));
  const p90 = getCurrentSlab(Math.max(effectiveDays, 90));

  // Estimate daily cost from first slab fine / first slab days
  const dailyCost = slabs[0] ? Math.round(slabs[0].fine / slabs[0].days_overdue) : 0;

  return {
    currentFine: current ? current.fine : 0,
    currentConsequence: current ? current.consequence : 'No penalty yet (within grace period)',
    projections: [
      { days: 7, fine: p7 ? p7.fine : 0, consequence: p7 ? p7.consequence : 'No penalty' },
      { days: 30, fine: p30 ? p30.fine : 0, consequence: p30 ? p30.consequence : 'No penalty' },
      { days: 90, fine: p90 ? p90.fine : 0, consequence: p90 ? p90.consequence : 'No penalty' },
    ],
    dailyCost,
    legalReference: rule.legal_reference,
  };
}
