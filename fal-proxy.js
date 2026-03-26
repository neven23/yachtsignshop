exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const FAL_KEY = process.env.FAL_KEY;
  const falHeaders = { 'Authorization': 'Key ' + FAL_KEY, 'Content-Type': 'application/json' };

  try {
    const body      = JSON.parse(event.body || '{}');
    const action    = body._action    || 'submit';
    const statusUrl = body._statusUrl || '';
    const resultUrl = body._resultUrl || '';

    // ── SUBMIT ────────────────────────────────────────────────
    if (action === 'submit') {
      const payload = Object.assign({}, body);
      delete payload._action;

      // Use Nano Banana 2 Edit — multi-image, semantic editing, $0.08/image
      const endpoint = 'https://queue.fal.run/fal-ai/nano-banana-2/edit';

      const res  = await fetch(endpoint, { method: 'POST', headers: falHeaders, body: JSON.stringify(payload) });
      const text = await res.text();
      if (!res.ok) return { statusCode: res.status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: text };

      const data = JSON.parse(text);
      if (!data.request_id) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'No request_id', raw: text.slice(0, 400) }) };

      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id:   data.request_id,
          status_url:   data.status_url,
          response_url: data.response_url
        })
      };
    }

    // ── STATUS ────────────────────────────────────────────────
    if (action === 'status') {
      if (!statusUrl) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing _statusUrl' }) };
      const res  = await fetch(statusUrl, { method: 'GET', headers: falHeaders });
      const text = await res.text();
      return { statusCode: res.status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: text };
    }

    // ── RESULT ────────────────────────────────────────────────
    if (action === 'result') {
      if (!resultUrl) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing _resultUrl' }) };
      const res  = await fetch(resultUrl, { method: 'GET', headers: falHeaders });
      const text = await res.text();
      return { statusCode: res.status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: text };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action: ' + action }) };

  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
