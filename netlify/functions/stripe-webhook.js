const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the event came from Stripe
    stripeEvent = Stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle events
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = stripeEvent.data.object;
      const { orderId, customerName, email, signName, material, size } = paymentIntent.metadata;
      const total = (paymentIntent.amount / 100).toFixed(2);

      console.log(`✅ Payment succeeded — Order ${orderId} · $${total}`);

      // Save order to Supabase
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
      if (SUPABASE_URL && SUPABASE_KEY && orderId) {
        const now = new Date().toISOString();
        const newOrder = {
          order_number: orderId,
          email: email || '',
          customer_name: customerName || '',
          material: material || '',
          size: size || '',
          sign_name: signName || '',
          stripe_payment_id: paymentIntent.id,
          total: parseFloat(total),
          status: 'proof_pending',
          status_message: "Your order has been received. We're preparing your design proof.",
          history: [{ status: 'proof_pending', label: 'Order Received', date: now, note: 'Payment confirmed via Stripe.' }],
          created_at: now,
          updated_at: now,
        };
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal,resolution=ignore-duplicates',
            },
            body: JSON.stringify(newOrder),
          });
          console.log(`   Supabase save: ${res.status}`);
        } catch(e) {
          console.error('   Supabase save failed:', e.message);
        }
      }
      // Send admin notification email
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
      const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Yacht Sign Shop <onboarding@resend.dev>';
      if (RESEND_API_KEY && ADMIN_EMAIL) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [ADMIN_EMAIL],
              subject: `🛥️ New Order: ${orderId} — $${total}`,
              html: `
                <div style="background:#0d1b2e;color:#ffffff;font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:0 auto;border-radius:8px;">
                  <p style="color:#b8892a;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">New Order Received</p>
                  <h2 style="margin:0 0 24px;font-size:24px;color:#ffffff;">Order ${orderId}</h2>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding:8px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Customer</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${customerName || '—'} &lt;${email || '—'}&gt;</td></tr>
                    <tr><td style="padding:8px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Sign Name</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${signName || '—'}</td></tr>
                    <tr><td style="padding:8px 0;color:#8899aa;font-size:14px;border-bottom:1px solid #1e2f45;">Material / Size</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;border-bottom:1px solid #1e2f45;">${material || '—'} · ${size || '—'}</td></tr>
                    <tr><td style="padding:8px 0;color:#8899aa;font-size:14px;">Amount Paid</td><td style="padding:8px 0;color:#d4a84b;font-size:16px;font-weight:bold;text-align:right;">$${total}</td></tr>
                  </table>
                  <div style="margin-top:28px;text-align:center;">
                    <a href="https://yachtsignshop.com/admin.html" style="background:#b8892a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:4px;font-size:13px;font-weight:600;letter-spacing:0.5px;display:inline-block;">Open Admin Panel</a>
                  </div>
                </div>
              `,
            }),
          });
        } catch(notifyErr) {
          console.error('Admin notification email failed:', notifyErr.message);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object;
      const { orderId, email } = paymentIntent.metadata;
      console.warn(`❌ Payment failed — Order ${orderId} (${email})`);
      console.warn(`   Reason: ${paymentIntent.last_payment_error?.message}`);
      break;
    }

    case 'charge.dispute.created': {
      const dispute = stripeEvent.data.object;
      console.warn(`⚠️ Dispute opened — Charge ${dispute.charge} · $${(dispute.amount / 100).toFixed(2)}`);
      break;
    }

    default:
      console.log(`Unhandled event: ${stripeEvent.type}`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
