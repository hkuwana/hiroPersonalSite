/** Shared helpers for the small public tool API (/api/...). */

export const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
} as const;

/** 2 MB ceiling. The tools handle personal-size files, not bulk exports. */
export const MAX_BODY_BYTES = 2_000_000;

/** Per-IP request ceiling for the tool API, per fixed one-minute window. */
export const RATE_LIMIT_PER_MINUTE = 60;

const RATE_WINDOW_MS = 60_000;
const rateHits = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort in-memory rate limit. Serverless note: the map lives per
 * instance, so the real ceiling is (instances x limit). The limit blocks
 * cheap abuse loops; volumetric attacks are the platform firewall's job.
 * Returns a 429 Response when the caller is over the limit, else null.
 */
export function checkRateLimit(ip: string): Response | null {
	const now = Date.now();

	if (rateHits.size > 10_000) {
		for (const [key, entry] of rateHits) {
			if (entry.resetAt <= now) rateHits.delete(key);
		}
	}

	const entry = rateHits.get(ip);
	if (!entry || entry.resetAt <= now) {
		rateHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return null;
	}

	entry.count += 1;
	if (entry.count <= RATE_LIMIT_PER_MINUTE) return null;

	const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
	return new Response(
		JSON.stringify({
			ok: false,
			error: `Rate limit exceeded. The limit is ${RATE_LIMIT_PER_MINUTE} requests per minute per IP.`
		}),
		{
			status: 429,
			headers: {
				...CORS_HEADERS,
				'Content-Type': 'application/json; charset=utf-8',
				'Retry-After': String(retryAfterSeconds)
			}
		}
	);
}

export function corsPreflight(): Response {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body, null, 2), {
		status,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' }
	});
}

/**
 * Read the request body as tool input text.
 * Accepts raw text (text/plain, text/calendar, text/vcard) or JSON with the
 * given field, for example {"ics": "..."} or {"vcf": "..."}.
 * Returns an error Response when the body is unusable.
 */
export async function readToolInput(
	request: Request,
	jsonField: string
): Promise<string | Response> {
	const raw = await request.text();

	if (raw.length > MAX_BODY_BYTES) {
		return jsonResponse(
			{ ok: false, error: `Body too large. The limit is ${MAX_BODY_BYTES} bytes.` },
			413
		);
	}

	const contentType = request.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		try {
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			const value = parsed[jsonField];
			if (typeof value !== 'string') {
				return jsonResponse(
					{ ok: false, error: `JSON body must contain a string field "${jsonField}".` },
					400
				);
			}
			return value;
		} catch {
			return jsonResponse({ ok: false, error: 'Body is not valid JSON.' }, 400);
		}
	}

	return raw;
}
