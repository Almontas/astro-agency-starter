import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_BLOG_AUDIENCE_ID = import.meta.env.RESEND_BLOG_AUDIENCE_ID;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY || !RESEND_BLOG_AUDIENCE_ID) {
    return json({ ok: false, error: 'Subscription is not configured.' }, 500);
  }

  let body: { email?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  if (typeof body?.website === 'string' && body.website.length > 0) {
    return json({ ok: true }, 200);
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    await resend.contacts.create({ email, audienceId: RESEND_BLOG_AUDIENCE_ID });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/already|exists|duplicate/i.test(message)) {
      console.error('subscribe.contacts.create failed', err);
      return json({ ok: false, error: 'Could not subscribe right now. Try again in a moment.' }, 500);
    }
  }

  try {
    const eventRes = await fetch('https://api.resend.com/events/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: 'blog.subscribed', email }),
    });
    if (!eventRes.ok) {
      console.error('subscribe.event failed', eventRes.status, await eventRes.text());
    }
  } catch (err) {
    console.error('subscribe.event exception', err);
  }

  return json({ ok: true }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
