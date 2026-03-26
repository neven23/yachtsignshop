exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Yacht Sign Shop <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, customerName, orderId, signName, material, finish, font, size, led, total, address, city, state, zip } = body;
  if (!email || !orderId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'email and orderId required' }) };
  }

  const shippingAddress = [address, city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  const SITE_URL = process.env.URL || 'https://yachtsignshop.com';

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

        <!-- Stars + Confirmation Badge -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <span style="color:#d4a84b;font-size:16px;letter-spacing:2px;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <p style="margin:12px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#8899aa;letter-spacing:2px;text-transform:uppercase;">ORDER CONFIRMED</p>
          </td>
        </tr>

        <!-- Main Heading -->
        <tr>
          <td style="padding:16px 40px 0;text-align:center;">
            <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:32px;font-weight:400;color:#ffffff;line-height:1.2;">Thank You for<br>Your Order</h1>
          </td>
        </tr>

        <!-- Intro Text -->
        <tr>
          <td style="padding:16px 50px 0;text-align:center;">
            <p style="margin:0;color:#8899aa;font-size:15px;line-height:1.7;">
              Hi ${customerName || 'there'}, we&rsquo;ve received your order and our craftsmen are reviewing your specifications now.
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

        <!-- Order Details Card -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#162033;border:1px solid #1e2f45;border-radius:8px;">
              <tr><td style="padding:28px 28px 8px;">
                <p style="margin:0 0 16px;color:#b8892a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Order Details</p>
              </td></tr>
              <tr><td style="padding:0 28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Order Number</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #1e2f45;">${orderId}</td>
                  </tr>
                  ${signName ? `<tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Sign Name</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;font-family:'DM Serif Display',Georgia,serif;font-style:italic;">${signName}</td>
                  </tr>` : ''}
                  ${material ? `<tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Material</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${material}</td>
                  </tr>` : ''}
                  ${finish ? `<tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Finish</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${finish}</td>
                  </tr>` : ''}
                  ${font ? `<tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Font</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${font}</td>
                  </tr>` : ''}
                  ${size ? `<tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Size</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${size}"</td>
                  </tr>` : ''}
                  ${led ? `<tr>
                    <td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">LED Lighting</td>
                    <td style="padding:10px 0;color:#ffffff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${led}</td>
                  </tr>` : ''}
                  ${total ? `<tr>
                    <td style="padding:14px 0 4px;color:#ffffff;font-size:15px;font-weight:600;">Order Total</td>
                    <td style="padding:14px 0 4px;color:#d4a84b;font-size:20px;font-weight:600;text-align:right;font-family:'DM Serif Display',Georgia,serif;">$${Number(total).toFixed(2)}</td>
                  </tr>` : ''}
                </table>
              </td></tr>
              <tr><td style="padding:0 0 20px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Shipping Address Card -->
        ${shippingAddress ? `<tr>
          <td style="padding:16px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#162033;border:1px solid #1e2f45;border-radius:8px;">
              <tr><td style="padding:24px 28px;">
                <p style="margin:0 0 12px;color:#b8892a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Shipping To</p>
                <p style="margin:0;color:#ffffff;font-size:14px;line-height:1.6;">${customerName || ''}</p>
                ${address ? `<p style="margin:4px 0 0;color:#c0ccda;font-size:14px;line-height:1.6;">${address}</p>` : ''}
                <p style="margin:4px 0 0;color:#c0ccda;font-size:14px;line-height:1.6;">${[city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</p>
              </td></tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- What's Next Section -->
        <tr>
          <td style="padding:32px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#162033;border:1px solid #1e2f45;border-radius:8px;">
              <tr><td style="padding:24px 28px;">
                <p style="margin:0 0 4px;color:#b8892a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">What Happens Next</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                  <tr>
                    <td style="width:32px;vertical-align:top;padding-top:2px;">
                      <table cellpadding="0" cellspacing="0"><tr><td style="width:24px;height:24px;background:#b8892a;border-radius:50%;text-align:center;color:#0d1b2e;font-size:12px;font-weight:700;line-height:24px;">1</td></tr></table>
                    </td>
                    <td style="padding:0 0 16px 8px;color:#c0ccda;font-size:14px;line-height:1.6;">
                      <strong style="color:#ffffff;">Design Proof</strong><br>We&rsquo;ll prepare a proof for your approval within 24&ndash;48 hours.
                    </td>
                  </tr>
                  <tr>
                    <td style="width:32px;vertical-align:top;padding-top:2px;">
                      <table cellpadding="0" cellspacing="0"><tr><td style="width:24px;height:24px;background:transparent;border:1.5px solid #1e2f45;border-radius:50%;text-align:center;color:#8899aa;font-size:12px;font-weight:700;line-height:22px;">2</td></tr></table>
                    </td>
                    <td style="padding:0 0 16px 8px;color:#c0ccda;font-size:14px;line-height:1.6;">
                      <strong style="color:#ffffff;">CNC Production</strong><br>Once approved, your sign enters our precision CNC workshop.
                    </td>
                  </tr>
                  <tr>
                    <td style="width:32px;vertical-align:top;padding-top:2px;">
                      <table cellpadding="0" cellspacing="0"><tr><td style="width:24px;height:24px;background:transparent;border:1.5px solid #1e2f45;border-radius:50%;text-align:center;color:#8899aa;font-size:12px;font-weight:700;line-height:22px;">3</td></tr></table>
                    </td>
                    <td style="padding:0 0 0 8px;color:#c0ccda;font-size:14px;line-height:1.6;">
                      <strong style="color:#ffffff;">Ships in 7 Days</strong><br>Hand-finished, inspected &amp; shipped with an install template.
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <a href="${SITE_URL}/track" style="display:inline-block;background:#b8892a;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:4px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.5px;">Track Your Order</a>
          </td>
        </tr>

        <!-- Secondary Link -->
        <tr>
          <td style="padding:16px 40px 0;text-align:center;">
            <a href="${SITE_URL}/how-it-works" style="color:#8899aa;font-size:13px;text-decoration:underline;">Learn about our craftsmanship process</a>
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
        subject: `Order Confirmed — ${orderId}`,
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
