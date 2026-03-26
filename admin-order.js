function buildShippingEmailHtml({ customerName, orderNumber, trackingNumber, trackingUrl }) {
  const SITE_URL = process.env.URL || 'https://yachtsignshop.com';
  const trackLink = trackingUrl || `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#0d1b2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#c9a84c;font-size:24px;font-weight:600;letter-spacing:1px;">YACHT SIGN SHOP</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#0d1b2e;font-size:22px;">Your order has shipped!</h2>
          <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">Hi ${customerName || 'there'}, great news &mdash; your custom yacht sign is on its way!</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:6px;margin-bottom:24px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 12px;color:#0d1b2e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Shipping Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;color:#777;font-size:14px;">Order Number</td><td style="padding:6px 0;color:#0d1b2e;font-size:14px;font-weight:600;text-align:right;">${orderNumber}</td></tr>
                <tr><td style="padding:6px 0;color:#777;font-size:14px;">Tracking Number</td><td style="padding:6px 0;color:#0d1b2e;font-size:14px;font-weight:600;text-align:right;">${trackingNumber}</td></tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.7;">You can track your package using the button below. Most orders arrive within 5&ndash;7 business days.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0;">
              <a href="${trackLink}" style="display:inline-block;background:#0d1b2e;color:#c9a84c;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.5px;">Track Your Package</a>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td align="center"><a href="${SITE_URL}/track" style="color:#0d1b2e;font-size:13px;text-decoration:underline;">View order status on our website</a></td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8f7f4;padding:24px 40px;border-top:1px solid #e8e6e0;">
          <p style="margin:0 0 4px;color:#999;font-size:12px;text-align:center;">Yacht Sign Shop</p>
          <p style="margin:0;color:#bbb;font-size:11px;text-align:center;">Questions? Reply to this email or visit <a href="${SITE_URL}/contact" style="color:#c9a84c;">our contact page</a>.</p>
        </td></tr>
      </table>
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
