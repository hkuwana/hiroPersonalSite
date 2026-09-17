import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { CONTACT } from '$data/constants';
import type { RequestHandler } from './$types';

export const prerender = false;
const MAX_BYTES = 48_000;
const hits = new Map<string, { count: number; until: number }>();
const fail = (status: number, error: string) => json({ ok: false, error }, { status });

export const POST: RequestHandler = async ({ request, fetch, url, getClientAddress }) => {
	if (request.headers.get('origin') !== url.origin) return fail(403, 'invalid-origin');
	if (!request.headers.get('content-type')?.includes('application/json'))
		return fail(415, 'invalid-content-type');

	// Best-effort, per-instance protection; use the Vercel firewall for distributed abuse.
	const now = Date.now();
	for (const [key, hit] of hits) if (hit.until <= now) hits.delete(key);
	const ip = getClientAddress();
	const hit = hits.get(ip) ?? { count: 0, until: now + 60_000 };
	hit.count++;
	hits.set(ip, hit);
	if (hit.count > 5 || hits.size > 10_000) {
		return json(
			{ ok: false, error: 'rate-limited' },
			{ status: 429, headers: { 'Retry-After': '60' } }
		);
	}

	let body: Record<string, unknown>;
	try {
		const reader = request.body?.getReader();
		if (!reader) return fail(400, 'invalid-body');
		const chunks: Uint8Array[] = [];
		let size = 0;
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_BYTES) {
				await reader.cancel();
				return fail(413, 'body-too-large');
			}
			chunks.push(value);
		}
		const bytes = new Uint8Array(size);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.byteLength;
		}
		body = JSON.parse(new TextDecoder().decode(bytes));
		if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'invalid-body');
	} catch {
		return fail(400, 'invalid-body');
	}
	if (body.website) return fail(400, 'invalid-body');
	const { name, email, message } = body;
	if (
		typeof name !== 'string' ||
		!name.trim() ||
		name.length > 120 ||
		/[\r\n]/.test(name) ||
		typeof email !== 'string' ||
		email.length > 254 ||
		!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim()) ||
		typeof message !== 'string' ||
		!message.trim() ||
		message.length > 10_000
	)
		return fail(400, 'invalid-fields');
	if (!env.RESEND_API_KEY || !env.RESEND_FROM) return fail(503, 'not-configured');

	const [user, domain, tld] = CONTACT.emailParts;
	const payload = {
		from: env.RESEND_FROM,
		to: [`${user}@${domain}.${tld}`],
		reply_to: email.trim(),
		subject: `Website message from ${name.trim()}`,
		text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`
	};
	try {
		const digest = await crypto.subtle.digest(
			'SHA-256',
			new TextEncoder().encode(JSON.stringify(payload))
		);
		const retryKey = Array.from(new Uint8Array(digest), (byte) =>
			byte.toString(16).padStart(2, '0')
		).join('');
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				authorization: `Bearer ${env.RESEND_API_KEY}`,
				'content-type': 'application/json',
				// Identical retries cannot duplicate a message within Resend's 24-hour window.
				'Idempotency-Key': `contact-${retryKey}`
			},
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(10_000)
		});
		if (!response.ok) return fail(502, 'delivery-failed');
		const result = await response.json();
		if (typeof result?.id !== 'string' || !result.id) return fail(502, 'delivery-failed');
		return json({ ok: true });
	} catch {
		return fail(502, 'delivery-failed');
	}
};
