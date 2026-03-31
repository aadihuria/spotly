import crypto from 'crypto';

const CODE_TTL_MINUTES = 10;

export function generateVerificationCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashVerificationCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function getVerificationExpiry(minutes = CODE_TTL_MINUTES) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isVerificationCodeExpired(expiresAt: Date) {
  return expiresAt.getTime() < Date.now();
}

export function isDevelopmentPreviewEnabled() {
  return process.env.NODE_ENV !== 'production';
}

export function getDevPreviewCode(code: string) {
  return isDevelopmentPreviewEnabled() ? code : undefined;
}

export async function deliverEmailVerificationCode(email: string, code: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (resendApiKey && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: 'Your Spotly verification code',
        text: `Your Spotly verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Email delivery failed: ${body || res.status}`);
    }

    return;
  }

  console.log(`[spotly] Email verification code for ${email}: ${code}`);
}

export async function deliverSmsVerificationCode(phone: string, code: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && from) {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your Spotly login code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`SMS delivery failed: ${text || res.status}`);
    }

    return;
  }

  console.log(`[spotly] SMS login code for ${phone}: ${code}`);
}
