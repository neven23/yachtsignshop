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
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0d1b2e;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1b2e;padding:0;">
    <tr><td align="center">

      <!-- Top Gold Accent Line -->
      <table width="600" cellpadding="0" cellspacing="0"><tr>
        <td style="height:3px;background:linear-gradient(90deg,#0d1b2e,#b8892a,#d4a84b,#b8892a,#0d1b2e);font-size:0;line-height:0;">&nbsp;</td>
      </tr></table>

      <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1b2e;">

        <!-- Header / Logo -->
        <tr>
          <td style="padding:40px 40px 0;text-align:center;">
            <table cellpadding="0" cellspacing="0" align="center"><tr>
              <td style="background:#0d1b2e;border:1.5px solid #b8892a;padding:8px 16px;">
                <span style="font-family:'DM Serif Display',Georgia,serif;font-size:14px;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">YACHT SIGN</span><br>
                <span style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;color:#b8892a;letter-spacing:4px;text-transform:uppercase;">SHOP</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Shipping Icon + Badge -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <span style="font-size:32px;">&#9978;</span>
            <p style="margin:12px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#b8892a;letter-spacing:2px;text-transform:uppercase;font-weight:600;">ORDER SHIPPED</p>
          </td>
        </tr>

        <!-- Main Heading -->
        <tr>
          <td style="padding:16px 40px 0;text-align:center;">
            <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:32px;font-weight:400;color:#ffffff;line-height:1.2;">Your Sign Is<br>On Its Way</h1>
          </td>
        </tr>

        <!-- Intro Text -->
        <tr>
          <td style="padding:16px 50px 0;text-align:center;">
            <p style="margin:0;color:#8899aa;font-size:15px;line-height:1.7;">
              Hi ${customerName || 'there'}, great news &mdash; your custom yacht sign has been hand-finished, inspected, and is now en route to you.
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:32px 60px 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="height:1px;background:#1e2f45;font-size:0;line-height:0;">&nbsp;</td>
            </tr></table>
          </td>
        </tr>

        <!-- Tracking Details Card -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#162033;border:1px solid #1e2f45;border-radius:8px;">
              <tr><td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px;color:#b8892a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Shipping Details</p>
              </td></tr>
              <tr><td style="padding:0 28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Order Number</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #1e2f45;">${orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;">Tracking Number</td>
                    <td style="padding:10px 0;color:#d4a84b;font-size:14px;font-weight:600;text-align:right;font-family:monospace;letter-spacing:0.5px;">${trackingNumber}</td>
                  </tr>
                </table>
              </td></tr>
              <tr><td style="padding:0 0 20px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Delivery Info -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#162033;border:1px solid #1e2f45;border-radius:8px;">
              <tr><td style="padding:24px 28px;">
                <p style="margin:0 0 4px;color:#b8892a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Delivery Info</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                  <tr>
                    <td style="padding:6px 0;color:#8899aa;font-size:14px;">Estimated Delivery</td>
                    <td style="padding:6px 0;color:#ffffff;font-size:14px;text-align:right;">5&ndash;7 business days</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#8899aa;font-size:14px;">Includes</td>
                    <td style="padding:6px 0;color:#ffffff;font-size:14px;text-align:right;">1:1 install template &amp; hardware</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- CTA Buttons -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <a href="${trackLink}" style="display:inline-block;background:#b8892a;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:4px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.5px;">Track Your Package</a>
          </td>
        </tr>

        <!-- Secondary Links -->
        <tr>
          <td style="padding:16px 40px 0;text-align:center;">
            <a href="${SITE_URL}/track" style="color:#8899aa;font-size:13px;text-decoration:underline;margin-right:16px;">View order status</a>
            <a href="${SITE_URL}/installation" style="color:#8899aa;font-size:13px;text-decoration:underline;">Installation guide</a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:40px 60px 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="height:1px;background:#1e2f45;font-size:0;line-height:0;">&nbsp;</td>
            </tr></table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;color:#8899aa;font-size:12px;">Questions? Reply to this email or call <strong style="color:#ffffff;">305-462-1848</strong></p>
            <p style="margin:0 0 16px;">
              <a href="${SITE_URL}/contact" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Contact</a>
              <span style="color:#1e2f45;">&middot;</span>
              <a href="${SITE_URL}/shipping" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Shipping</a>
              <span style="color:#1e2f45;">&middot;</span>
              <a href="${SITE_URL}/returns" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Returns</a>
              <span style="color:#1e2f45;">&middot;</span>
              <a href="${SITE_URL}/installation" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Installation</a>
            </p>
            <p style="margin:0;color:#4a5568;font-size:11px;">Marine-grade custom boat name signs. Hand-crafted for vessels that deserve to make an impression.</p>
          </td>
        </tr>

        <!-- Bottom padding -->
        <tr><td style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <!-- Bottom Gold Accent Line -->
      <table width="600" cellpadding="0" cellspacing="0"><tr>
        <td style="height:3px;background:linear-gradient(90deg,#0d1b2e,#b8892a,#d4a84b,#b8892a,#0d1b2e);font-size:0;line-height:0;">&nbsp;</td>
      </tr></table>

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
