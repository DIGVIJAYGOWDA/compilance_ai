export const PENALTY_RULES = {
  FSSAI: {
    name: 'FSSAI Food License', grace_days: 0,
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
    name: 'Fire NOC', grace_days: 0,
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
    name: 'Trade License', grace_days: 30,
    slabs: [
      { days_overdue: 1, fine: 1000, consequence: 'Late fee applied' },
      { days_overdue: 30, fine: 5000, consequence: 'Penalty notice' },
      { days_overdue: 90, fine: 15000, consequence: 'License suspension' },
      { days_overdue: 180, fine: 30000, consequence: 'Business sealing order' },
    ],
    legal_reference: 'BBMP Act, 1976',
  },
  SHOP_ESTABLISHMENT: {
    name: 'Shop & Establishment', grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 1000, consequence: 'Fine issued' },
      { days_overdue: 30, fine: 5000, consequence: 'Labour inspector notice' },
      { days_overdue: 90, fine: 20000, consequence: 'Prosecution under Labour Act' },
    ],
    legal_reference: 'Karnataka Shops and Commercial Establishments Act, 1961',
  },
  EATING_HOUSE: {
    name: 'Eating House License', grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 2000, consequence: 'Police notice' },
      { days_overdue: 30, fine: 10000, consequence: 'Show cause notice' },
      { days_overdue: 60, fine: 25000, consequence: 'Closure order by police' },
      { days_overdue: 180, fine: 50000, consequence: 'Criminal proceedings under IPC' },
    ],
    legal_reference: 'Karnataka Police Act, 1963',
  },
  GST: {
    name: 'GST Registration', grace_days: 0,
    slabs: [
      { days_overdue: 1, fine: 10000, consequence: 'Late fee per return' },
      { days_overdue: 30, fine: 25000, consequence: 'Notice from GST department' },
      { days_overdue: 90, fine: 50000, consequence: 'Registration cancellation' },
    ],
    legal_reference: 'GST Act, 2017 — Section 69',
  },
  SIGNAGE: {
    name: 'Signage / Advertisement License', grace_days: 15,
    slabs: [
      { days_overdue: 1,  fine: 500,   consequence: 'Late fee levied by BBMP' },
      { days_overdue: 15, fine: 2000,  consequence: 'Penalty notice from civic body' },
      { days_overdue: 30, fine: 5000,  consequence: 'Signage removal order' },
      { days_overdue: 90, fine: 15000, consequence: 'Forced removal and sealing of hoarding' },
    ],
    legal_reference: 'BBMP Advertisement Bye-Laws, 2006',
  },
  DRUG_LICENSE: {
    name: 'Drug License', grace_days: 0,
    slabs: [
      { days_overdue: 1,  fine: 5000,   consequence: 'Warning notice from Drug Inspector' },
      { days_overdue: 7,  fine: 15000,  consequence: 'Show cause notice; stock seizure possible' },
      { days_overdue: 30, fine: 50000,  consequence: 'Suspension of drug sale operations' },
      { days_overdue: 90, fine: 200000, consequence: 'Criminal prosecution under Drugs & Cosmetics Act' },
    ],
    legal_reference: 'Drugs and Cosmetics Act, 1940 — Section 18',
  },
};

export function calculatePenalty(licenseType, daysOverdue) {
  const rule = PENALTY_RULES[licenseType];
  if (!rule) return null;

  const effectiveDays = Math.max(0, daysOverdue - rule.grace_days);
  
  // Find current slab
  let currentFine = 0;
  let currentConsequence = 'Within grace period';
  for (const slab of rule.slabs) {
    if (effectiveDays >= slab.days_overdue) {
      currentFine = slab.fine;
      currentConsequence = slab.consequence;
    }
  }

  // Daily cost (fine increase per day)
  const maxFine = rule.slabs[rule.slabs.length - 1]?.fine || 0;
  const maxDays = rule.slabs[rule.slabs.length - 1]?.days_overdue || 180;
  const dailyCost = Math.round(maxFine / maxDays);

  // Projections
  const getFinAt = (d) => {
    let f = 0;
    for (const slab of rule.slabs) {
      if (d >= slab.days_overdue) f = slab.fine;
    }
    return f;
  };

  return {
    currentFine,
    currentConsequence,
    projections: [
      { days: 7, fine: getFinAt(effectiveDays + 7), consequence: rule.slabs.find(s => effectiveDays + 7 >= s.days_overdue)?.consequence || '' },
      { days: 30, fine: getFinAt(effectiveDays + 30), consequence: rule.slabs.find(s => effectiveDays + 30 >= s.days_overdue)?.consequence || '' },
      { days: 90, fine: getFinAt(effectiveDays + 90), consequence: rule.slabs.find(s => effectiveDays + 90 >= s.days_overdue)?.consequence || '' },
    ],
    dailyCost,
    legalReference: rule.legal_reference,
  };
}
