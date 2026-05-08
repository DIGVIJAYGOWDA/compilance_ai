/**
 * Compliance score calculation and summary helpers
 */
export function calculateComplianceScore(licenses) {
  if (!licenses || licenses.length === 0) {
    return { score: 100, grade: 'A', color: 'green', colorHex: '#16A34A', message: 'Add licenses to track compliance' };
  }

  const now = new Date();
  let deductions = 0;

  for (const license of licenses) {
    if (!license.expiry_date) continue;
    const expiry = new Date(license.expiry_date);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) deductions += 20;
    else if (daysLeft <= 7) deductions += 15;
    else if (daysLeft <= 30) deductions += 8;
    else if (daysLeft <= 60) deductions += 3;
  }

  const score = Math.max(0, 100 - deductions);
  let grade, color, colorHex, message;

  if (score >= 80) {
    grade = 'A'; color = 'green'; colorHex = '#16A34A'; message = 'Fully Compliant';
  } else if (score >= 60) {
    grade = 'B'; color = 'blue'; colorHex = '#1A56DB'; message = 'Mostly Compliant';
  } else if (score >= 40) {
    grade = 'C'; color = 'amber'; colorHex = '#F59E0B'; message = 'Needs Attention';
  } else {
    grade = 'D'; color = 'red'; colorHex = '#DC2626'; message = 'Critical — Immediate Action Required';
  }

  return { score, grade, color, colorHex, message };
}

export function getLicenseSummary(licenses) {
  const now = new Date();
  let expired = 0, expiringMonth = 0, active = 0;

  for (const l of licenses) {
    if (!l.expiry_date) continue;
    const expiry = new Date(l.expiry_date);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) expired++;
    else if (daysLeft <= 30) expiringMonth++;
    else active++;
  }

  return { total: licenses.length, expired, expiringMonth, active };
}
