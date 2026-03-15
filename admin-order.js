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

    // First fetch existing to append to history
    const existing = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order_number.trim().toUpperCase())}&select=history`,
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
    return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) };
};
