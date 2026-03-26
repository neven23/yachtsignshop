exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { order_number, email } = body;
  if (!order_number || !email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Order number and email required' }) };
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order_number.trim().toUpperCase())}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const data = await res.json();

    if (!data || data.length === 0) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Order not found. Please check your order number.' }) };
    }

    const order = data[0];

    // Verify email matches (case-insensitive)
    if (order.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Email address does not match this order.' }) };
    }

    // Return safe subset (no internal notes)
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        order_number: order.order_number,
        customer_name: order.customer_name,
        status: order.status,
        status_message: order.status_message,
        material: order.material,
        size: order.size,
        sign_name: order.sign_name,
        created_at: order.created_at,
        estimated_ship_date: order.estimated_ship_date,
        tracking_number: order.tracking_number,
        tracking_url: order.tracking_url,
        proof_url: order.proof_url,
        history: order.history || [],
      })
    };
  } catch(err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server error. Please try again.' }) };
  }
};
