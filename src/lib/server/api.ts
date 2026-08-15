/** Shared helpers for the small public tool API (/api/...). */

export const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
} as const;

/** 2 MB ceiling. The tools handle personal-size files, not bulk exports. */
export const MAX_BODY_BYTES = 2_000_000;

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
