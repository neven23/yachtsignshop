function buildShippingEmailHtml({ customerName, orderNumber, trackingNumber, trackingUrl }) {
  const SITE_URL = process.env.URL || 'https://yachtsignshop.com';
  const trackLink = trackingUrl || `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0d1b2e;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1b2e;padding:0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"><tr><td style="height:3px;background:linear-gradient(90deg,#0d1b2e,#b8892a,#d4a84b,#b8892a,#0d1b2e);font-size:0;line-height:0;">&nbsp;</td></tr></table>
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1b2e;">
        <tr><td style="padding:40px 40px 0;text-align:center;">
          <table cellpadding="0" cellspacing="0" align="center"><tr><td style="border:1.5px solid #b8892a;padding:8px 16px;">
            <span style="font-family:'DM Serif Display',Georgia,serif;font-size:14px;color:#ffffff;letter-spacing:2px;">YACHT SIGN</span><br>
            <span style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;color:#b8892a;letter-spacing:4px;">SHOP</span>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:32px 40px 0;text-align:center;">
          <span style="font-size:32px;">&#9978;</span>
          <p style="margin:12px 0 0;font-size:11px;color:#b8892a;letter-spacing:2px;text-transform:uppercase;font-weight:600;">ORDER SHIPPED</p>
        </td></tr>
        <tr><td style="padding:16px 40px 0;text-align:center;">
          <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:32px;font-weight:400;color:#ffffff;line-height:1.2;">Your Sign Is<br>On Its Way</h1>
        </td></tr>
        <tr><td style="padding:16px 50px 0;text-align:center;">
          <p style="margin:0;color:#8899aa;font-size:15px;line-height:1.7;">Hi ${customerName || 'there'}, great news &mdash; your custom yacht sign has been hand-finished, inspected, and is now en route to you.</p>
        </td></tr>
        <tr><td style="padding:32px 60px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background:#1e2f45;font-size:0;">&nbsp;</td></tr></table></td></tr>
        <tr><td style="padding:24px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#162033;border:1px solid #1e2f45;border-radius:8px;">
            <tr><td style="padding:28px 28px 8px;"><p style="margin:0 0 16px;color:#b8892a;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Shipping Details</p></td></tr>
            <tr><td style="padding:0 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Order Number</td><td style="padding:10px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #1e2f45;">${orderNumber}</td></tr>
                <tr><td style="padding:10px 0;color:#8899aa;font-size:14px;">Tracking Number</td><td style="padding:10px 0;color:#d4a84b;font-size:14px;font-weight:600;text-align:right;font-family:monospace;letter-spacing:0.5px;">${trackingNumber}</td></tr>
              </table>
            </td></tr>
            <tr><td style="padding:0 0 20px;">&nbsp;</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:32px 40px 0;text-align:center;">
          <a href="${trackLink}" style="display:inline-block;background:#b8892a;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:4px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.5px;">Track Your Package</a>
        </td></tr>
        <tr><td style="padding:16px 40px 0;text-align:center;">
          <a href="${SITE_URL}/track" style="color:#8899aa;font-size:13px;text-decoration:underline;margin-right:16px;">View order status</a>
          <a href="${SITE_URL}/installation" style="color:#8899aa;font-size:13px;text-decoration:underline;">Installation guide</a>
        </td></tr>
        <tr><td style="padding:40px 60px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background:#1e2f45;font-size:0;">&nbsp;</td></tr></table></td></tr>
        <tr><td style="padding:24px 40px;text-align:center;">
          <p style="margin:0 0 8px;color:#8899aa;font-size:12px;">Questions? Reply to this email or call <strong style="color:#ffffff;">1-800-SIGN-NOW</strong></p>
          <p style="margin:0 0 16px;">
            <a href="${SITE_URL}/contact" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Contact</a><span style="color:#1e2f45;">&middot;</span>
            <a href="${SITE_URL}/shipping" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Shipping</a><span style="color:#1e2f45;">&middot;</span>
            <a href="${SITE_URL}/returns" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Returns</a><span style="color:#1e2f45;">&middot;</span>
            <a href="${SITE_URL}/installation" style="color:#b8892a;font-size:12px;text-decoration:none;margin:0 8px;">Installation</a>
          </p>
          <p style="margin:0;color:#4a5568;font-size:11px;">Marine-grade custom boat name signs. Hand-crafted for vessels that deserve to make an impression.</p>
        </td></tr>
        <tr><td style="height:20px;font-size:0;">&nbsp;</td></tr>
      </table>
      <table width="600" cellpadding="0" cellspacing="0"><tr><td style="height:3px;background:linear-gradient(90deg,#0d1b2e,#b8892a,#d4a84b,#b8892a,#0d1b2e);font-size:0;line-height:0;">&nbsp;</td></tr></table>
    </td></tr>
  </table>
</body>
</html>`;
}

exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN_KEY    = process.env.ADMIN_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY || !ADMIN_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  // Auth check
  const providedKey = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  if (providedKey !== ADMIN_KEY) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // GET — list all orders
  if (event.httpMethod === 'GET') {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action } = body;

  // CREATE order
  if (action === 'create') {
    const { order_number, email, customer_name, material, size, sign_name, estimated_ship_date } = body;
    if (!order_number || !email) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'order_number and email required' }) };
    }
    const now = new Date().toISOString();
    const newOrder = {
      order_number: order_number.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      customer_name: customer_name || '',
      material: material || '',
      size: size || '',
      sign_name: sign_name || '',
      status: 'proof_pending',
      status_message: 'Your order has been received. We\'re preparing your design proof.',
      estimated_ship_date: estimated_ship_date || null,
      tracking_number: null,
      tracking_url: null,
      proof_url: null,
      history: [{ status: 'proof_pending', label: 'Order Received', date: now, note: 'Order confirmed and entered into production queue.' }],
      created_at: now,
      updated_at: now,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newOrder),
    });
    const data = await res.json();
    return { statusCode: 201, headers: CORS, body: JSON.stringify(data) };
  }

  // UPDATE order status
  if (action === 'update') {
    const { order_number, status, status_message, tracking_number, tracking_url, proof_url, estimated_ship_date, note } = body;
    if (!order_number || !status) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'order_number and status required' }) };
    }

    // First fetch existing to append to history (also grab email + customer_name for notifications)
    const existing = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order_number.trim().toUpperCase())}&select=history,email,customer_name`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const existingData = await existing.json();
    if (!existingData || existingData.length === 0) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Order not found' }) };
    }

    const STATUS_LABELS = {
      proof_pending: 'Order Received',
      proof_sent: 'Proof Sent',
      approved: 'Design Approved',
      in_production: 'In Production',
      quality_check: 'Quality Check',
      shipped: 'Shipped',
      delivered: 'Delivered',
    };

    const history = existingData[0].history || [];
    history.push({
      status,
      label: STATUS_LABELS[status] || status,
      date: new Date().toISOString(),
      note: note || '',
    });

    const updates = {
      status,
      status_message: status_message || '',
      history,
      updated_at: new Date().toISOString(),
    };
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (tracking_url !== undefined) updates.tracking_url = tracking_url;
    if (proof_url !== undefined) updates.proof_url = proof_url;
    if (estimated_ship_date !== undefined) updates.estimated_ship_date = estimated_ship_date;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order_number.trim().toUpperCase())}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
      }
    );
    const data = await res.json();

    // Auto-send shipping email when status changes to 'shipped' with a tracking number
    if (status === 'shipped' && tracking_number) {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const orderEmail = existingData[0].email;
        const orderName = existingData[0].customer_name;
        if (orderEmail) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || 'Yacht Sign Shop <onboarding@resend.dev>',
                to: [orderEmail],
                subject: `Your Order ${order_number.trim().toUpperCase()} Has Shipped!`,
                html: buildShippingEmailHtml({
                  customerName: orderName,
                  orderNumber: order_number.trim().toUpperCase(),
                  trackingNumber: tracking_number,
                  trackingUrl: tracking_url,
                }),
              }),
            });
          } catch(emailErr) {
            console.error('Failed to send shipping email:', emailErr);
          }
        }
      }
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) };
};
