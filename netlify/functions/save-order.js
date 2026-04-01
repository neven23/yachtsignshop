// save-order.js — Called from the frontend after successful Stripe payment.
// Verifies the payment with Stripe before saving to Supabase.
// This is the primary order-save path; the webhook is a backup.

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
  const STRIPE_KEY   = process.env.STRIPE_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database not configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    orderId, stripePaymentId, customerName, email,
    signName, material, finish, font, size, led,
    total, address, city, state, zip, cart
  } = body;

  if (!orderId || !stripePaymentId || !email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'orderId, stripePaymentId, and email required' }) };
  }

  // Verify the payment actually succeeded with Stripe (prevent fake orders)
  if (STRIPE_KEY) {
    try {
      const Stripe = require('stripe')(STRIPE_KEY);
      const pi = await Stripe.paymentIntents.retrieve(stripePaymentId);
      if (pi.status !== 'succeeded') {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Payment not confirmed' }) };
      }
    } catch(e) {
      console.error('Stripe verification failed:', e.message);
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Could not verify payment' }) };
    }
  }

  const now = new Date().toISOString();

  const newOrder = {
    order_number: orderId.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    customer_name: customerName || '',
    material: material || '',
    size: size || '',
    sign_name: signName || '',
    stripe_payment_id: stripePaymentId,
    total: parseFloat(total) || 0,
    status: 'proof_pending',
    status_message: "Your order has been received. We're preparing your design proof.",
    history: [{ status: 'proof_pending', label: 'Order Received', date: now, note: 'Payment confirmed.' }],
    created_at: now,
    updated_at: now,
  };

  try {
    // Upsert — if the webhook already saved it, don't duplicate
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify(newOrder),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Supabase save error:', data);
      // If it's a duplicate key error, that's fine — webhook already saved it
      if (res.status === 409 || (data.code === '23505')) {
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, note: 'Order already exists' }) };
      }
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ error: data.message || 'Failed to save order' }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, order: data }) };
  } catch(err) {
    console.error('Save order error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to save order' }) };
  }
};
