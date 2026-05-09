const ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const FROM_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_FROM;

/**
 * Send a WhatsApp reminder via Twilio Sandbox.
 * Note: Twilio sandbox only delivers to numbers that have joined the sandbox.
 */
export async function sendWhatsAppReminder(toPhone, ownerName, licenseName, daysLeft, expiryDate, penalty) {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !toPhone) return false;

  const urgency = daysLeft < 0
    ? `⛔ EXPIRED ${Math.abs(daysLeft)} days ago`
    : daysLeft === 0
      ? '🚨 EXPIRES TODAY'
      : `⚠️ Expires in ${daysLeft} days`;

  const penaltyLine = penalty ? `\n💰 Penalty after expiry: ${penalty}` : '';

  const body = `🔔 *ComplianceAI Reminder*

Hi ${ownerName},

Your *${licenseName}* ${urgency}.
📅 Expiry Date: ${expiryDate}${penaltyLine}

Renew now to stay compliant.
— ComplianceAI`;

  // Clean the phone number — ensure it starts with country code
  const cleanPhone = toPhone.replace(/\s+/g, '').replace(/^0+/, '');
  const formattedTo = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams();
  params.append('To', `whatsapp:${formattedTo}`);
  params.append('From', `whatsapp:${FROM_NUMBER}`);
  params.append('Body', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn('[WhatsApp] Failed:', err.message);
      return false;
    }

    console.log(`[WhatsApp] Reminder sent to ${formattedTo}`);
    return true;
  } catch (err) {
    console.error('[WhatsApp] Error:', err);
    return false;
  }
}
