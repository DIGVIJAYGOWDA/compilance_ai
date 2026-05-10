// Configuration for EmailJS
const SERVICE_ID = 'service_bp0yb1r';
const TEMPLATE_ID = 'template_2yarh9f';
const PUBLIC_KEY = '3CJycBgrfPho-Z9LC';

export async function sendReminderEmail(to, ownerName, licenseName, daysLeft, expiryDate, penalty, renewalUrl) {
  const urgencyLabel = daysLeft < 0 ? 'EXPIRED' : daysLeft === 0 ? 'EXPIRES TODAY' : `${daysLeft} DAYS LEFT`;
  const penaltyStr = penalty || 'None';

  // EmailJS REST API payload
  const payload = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: {
      to_email: to,
      owner_name: ownerName,
      license_name: licenseName,
      urgency_label: urgencyLabel,
      expiry_date: expiryDate,
      penalty: penaltyStr
    }
  };

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`EmailJS Error: ${errorText}`);
  }
  
  return true;
}
