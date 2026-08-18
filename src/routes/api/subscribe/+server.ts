import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { CONTACT } from '$data/constants';
import type { RequestHandler } from './$types';

// Runs as a serverless function on Vercel; everything else on the site is prerendered.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHOICES = new Set(['both', 'philo', 'guides']);
const [contactUser, contactDomain, contactTopLevelDomain] = CONTACT.emailParts;
const contactEmail = `${contactUser}@${contactDomain}.${contactTopLevelDomain}`;

// Storage: Supabase table `subscribers` (email text primary key, choice text,
// created_at timestamptz default now()) with an anon INSERT policy.
// Notification: Resend email to the address assembled from CONTACT.emailParts.
// Either channel alone counts as success.
export const POST: RequestHandler = async ({ request, fetch }) => {
	let body: { email?: string; choice?: string };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid-body' }, { status: 400 });
	}

	const email = (body.email ?? '').trim().toLowerCase();
	const choice = CHOICES.has(body.choice ?? '') ? (body.choice as string) : 'both';
	if (!EMAIL_RE.test(email) || email.length > 254) {
		return json({ ok: false, error: 'invalid-email' }, { status: 400 });
	}

	let stored = false;
	let notified = false;

	if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
		try {
			const res = await fetch(`${env.SUPABASE_URL}/rest/v1/subscribers`, {
				method: 'POST',
				headers: {
					apikey: env.SUPABASE_ANON_KEY,
					authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
					'content-type': 'application/json',
					prefer: 'resolution=ignore-duplicates'
				},
				body: JSON.stringify({ email, choice })
			});
			stored = res.ok || res.status === 409;
		} catch {
			stored = false;
		}
	}

	if (env.RESEND_API_KEY) {
		try {
			const res = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					authorization: `Bearer ${env.RESEND_API_KEY}`,
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					from: env.RESEND_FROM ?? 'Site <onboarding@resend.dev>',
					to: [contactEmail],
					subject: `New subscriber: ${email}`,
					text: `${email} subscribed to: ${choice}`
				})
			});
			notified = res.ok;
		} catch {
			notified = false;
		}
	}

	if (!stored && !notified) {
		return json({ ok: false, error: 'not-configured' }, { status: 503 });
	}
	return json({ ok: true });
};
