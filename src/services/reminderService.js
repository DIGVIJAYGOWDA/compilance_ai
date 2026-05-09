import { sendReminderEmail } from './emailService';
import { sendWhatsAppReminder } from './whatsappService';
import { formatCurrency } from '../utils/formatters';
import { PENALTY_RULES } from '../utils/penaltyRules';
import { supabase } from './supabase';

/**
 * Log a sent reminder to the reminders table in Supabase.
 */
async function logReminder(licenseId, reminderStage, channel, status = 'sent') {
  try {
    await supabase.from('reminders').insert({
      license_id: licenseId,
      reminder_stage: reminderStage,
      channel,
      status,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Reminders] Failed to log reminder to DB:', err);
  }
}

/**
 * Checks all licenses for the active business and sends reminder emails + WhatsApp
 * for any license whose days-left matches the user's reminder preferences.
 * Runs once per login per business (tracked in sessionStorage to avoid duplicates).
 */
export async function checkAndSendReminders(business, licenses) {
  if (!business || !licenses || licenses.length === 0) return;
  if (!business.email_reminders) return; // User has reminders turned off

  const sessionKey = `reminders_checked_${business.id}`;
  if (sessionStorage.getItem(sessionKey)) return; // Already ran this session
  sessionStorage.setItem(sessionKey, 'true');

  const userEmail = business.email;
  const ownerName = business.owner_name || business.business_name;
  const reminderDays = business.reminder_days || [60, 30, 7];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const remindersToSend = [];

  for (const license of licenses) {
    if (!license.expiry_date) continue;

    const expiry = new Date(license.expiry_date);
    expiry.setHours(0, 0, 0, 0);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.round((expiry - today) / msPerDay);

    // Check if today matches any of the user's reminder day thresholds (±1 day tolerance)
    const matchedStage = reminderDays.find(d => Math.abs(daysLeft - d) <= 1);
    const isExpiringSoon = daysLeft >= -1 && daysLeft <= 60; // Don't remind about very old expired

    if (!matchedStage || !isExpiringSoon) continue;

    // Look up penalty for this license type
    const penaltyRule = PENALTY_RULES?.[license.license_type];
    const penaltyStr = penaltyRule
      ? `${formatCurrency(penaltyRule.slabs?.[0]?.fine || 0)} – ${formatCurrency(penaltyRule.slabs?.[penaltyRule.slabs.length - 1]?.fine || 0)}`
      : null;

    const renewalUrl = license.renewal_portal_url || 'https://compliance.ai/dashboard';

    remindersToSend.push({
      licenseId: license.id,
      to: userEmail,
      ownerName,
      licenseName: license.license_type?.replace(/_/g, ' ') || 'License',
      daysLeft,
      matchedStage,
      expiryDate: expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      penalty: penaltyStr,
      renewalUrl,
    });
  }

  if (remindersToSend.length === 0) return;

  const userPhone = business.whatsapp_reminders ? (business.phone || business.owner_phone || null) : null;

  // Send all reminders and log to DB
  for (const r of remindersToSend) {
    // Email
    try {
      await sendReminderEmail(r.to, r.ownerName, r.licenseName, r.daysLeft, r.expiryDate, r.penalty, r.renewalUrl);
      await logReminder(r.licenseId, r.matchedStage, 'email', 'sent');
      console.log(`[Reminders] Email sent for ${r.licenseName}`);
    } catch {
      await logReminder(r.licenseId, r.matchedStage, 'email', 'failed');
    }

    // WhatsApp
    if (userPhone) {
      try {
        const ok = await sendWhatsAppReminder(userPhone, r.ownerName, r.licenseName, r.daysLeft, r.expiryDate, r.penalty);
        await logReminder(r.licenseId, r.matchedStage, 'sms', ok ? 'sent' : 'failed');
        if (ok) console.log(`[Reminders] WhatsApp sent for ${r.licenseName}`);
      } catch {
        await logReminder(r.licenseId, r.matchedStage, 'sms', 'failed');
      }
    }
  }
}
