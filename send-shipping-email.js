exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Yacht Sign Shop <onboarding@resend.dev>';
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

  if (!RESEND_API_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  // Auth check — only admin or internal calls
  const providedKey = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  if (providedKey !== ADMIN_KEY) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, customerName, orderNumber, trackingNumber, trackingUrl } = body;
  if (!email || !orderNumber || !trackingNumber) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'email, orderNumber, and trackingNumber required' }) };
  }

  const SITE_URL = process.env.URL || 'https://yachtsignshop.com';
  const trackLink = trackingUrl || `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0d1b2e;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#c9a84c;font-size:24px;font-weight:600;letter-spacing:1px;">YACHT SIGN SHOP</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#0d1b2e;font-size:22px;">Your order has shipped!</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
              Hi ${customerName || 'there'}, great news &mdash; your custom yacht sign is on its way!
            </p>

            <!-- Shipping Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:6px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <p style="margin:0 0 12px;color:#0d1b2e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Shipping Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#777;font-size:14px;">Order Number</td>
                    <td style="padding:6px 0;color:#0d1b2e;font-size:14px;font-weight:600;text-align:right;">${orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#777;font-size:14px;">Tracking Number</td>
                    <td style="padding:6px 0;color:#0d1b2e;font-size:14px;font-weight:600;text-align:right;">${trackingNumber}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.7;">
              You can track your package using the button below. Most orders arrive within 5&ndash;7 business days.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0;">
                <a href="${trackLink}" style="display:inline-block;background:#0d1b2e;color:#c9a84c;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.5px;">Track Your Package</a>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr><td align="center">
                <a href="${SITE_URL}/track" style="color:#0d1b2e;font-size:13px;text-decoration:underline;">View order status on our website</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f7f4;padding:24px 40px;border-top:1px solid #e8e6e0;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;text-align:center;">Yacht Sign Shop</p>
            <p style="margin:0;color:#bbb;font-size:11px;text-align:center;">
              Questions? Reply to this email or visit <a href="${SITE_URL}/contact" style="color:#c9a84c;">our contact page</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Your Order ${orderNumber} Has Shipped!`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ error: data.message || 'Failed to send email' }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, id: data.id }) };
  } catch(err) {
    console.error('Email send error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to send email' }) };
  }
};
