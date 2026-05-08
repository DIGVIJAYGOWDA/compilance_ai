/**
 * Format number as Indian Rupee
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to readable Indian format: 12 Mar 2024
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Returns days left from today to a date (negative = overdue)
 */
export function getDaysLeft(expiryDateStr) {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-readable days-left label
 */
export function getDaysLabel(daysLeft) {
  if (daysLeft === null) return 'No expiry';
  if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
  if (daysLeft === 0) return 'Expires today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}

/**
 * Returns status string based on days left
 */
export function getStatusFromDays(daysLeft) {
  if (daysLeft === null) return 'active';
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring';
  return 'active';
}

/**
 * Format large numbers with Indian style (e.g., 1,00,000)
 */
export function formatIndianNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Truncate text to given length
 */
export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/**
 * Get greeting based on current hour
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
