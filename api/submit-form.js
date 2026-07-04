const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MIN_SUBMIT_TIME_MS = 3000; // Reject submissions faster than 3 seconds

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    _gotcha,
    _loadedAt,
    'cf-turnstile-response': turnstileToken,
    name,
    email,
    company,
    goals,
    revenue,
    service_interest,
    growth_challenge,
  } = req.body;

  // Layer 1: Honeypot check
  if (_gotcha) {
    // Silently accept to not tip off bots, but don't forward
    return res.status(200).json({ ok: true });
  }

  // Bonus: Time-based check
  const loadedAt = parseInt(_loadedAt, 10);
  if (!loadedAt || Date.now() - loadedAt < MIN_SUBMIT_TIME_MS) {
    return res.status(200).json({ ok: true }); // Silent reject
  }

  // Required-field guard: never forward a submission missing the baseline
  // fields every form on the site shares, even if client validation was
  // bypassed. Per-form requirements (e.g. revenue on the contact form) are
  // enforced client-side so this endpoint stays shared across landing pages.
  if (!name || !email) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  // Layer 2+3: Server-side Turnstile validation
  if (!turnstileToken) {
    return res.status(400).json({ error: 'Verification token missing. Please try again.' });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: turnstileToken,
      }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return res.status(403).json({ error: 'Verification failed. Please refresh and try again.' });
    }
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return res.status(500).json({ error: 'Verification service unavailable. Please try again later.' });
  }

  // Forward to Formspark
  const formsparkId = process.env.FORMSPARK_FORM_ID;
  if (!formsparkId) {
    console.error('FORMSPARK_FORM_ID not configured');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const formsparkRes = await fetch(`https://submit-form.com/${formsparkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, revenue, goals, service_interest, growth_challenge }),
    });

    if (!formsparkRes.ok) {
      console.error('Formspark error:', formsparkRes.status, await formsparkRes.text());
      return res.status(502).json({ error: 'Failed to submit form. Please try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Formspark submission error:', err);
    return res.status(502).json({ error: 'Failed to submit form. Please try again.' });
  }
}
