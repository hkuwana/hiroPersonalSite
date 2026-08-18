import type { RequestHandler } from './$types';
import { redact, REDACTION_TYPES, type RedactionType } from '$lib/tools/redact';
import {
	checkRateLimit,
	corsPreflight,
	jsonResponse,
	MAX_BODY_BYTES,
	RATE_LIMIT_PER_MINUTE
} from '$lib/server/api';

export const prerender = false;

const USAGE = {
	endpoint: 'POST /api/text/redact',
	accepts: [
		'text/plain: the raw text as the request body, with every type enabled',
		'application/json: {"text": "...", "types": ["EMAIL"], "terms": ["Acme Corp"]}'
	],
	returns:
		'JSON { ok, text, map, counts }. "text" is the redacted text. "map" is placeholder -> original value, and it is the only way to reverse the result.',
	types: REDACTION_TYPES,
	terms:
		'Person names are not detected. Pass them in "terms" as exact strings. A regular expression cannot find a name without guessing, and a guess fails silently.',
	restore:
		'There is no restore endpoint by design. Reversal needs the original values, so it stays in the browser at /tools/safe-paste.',
	limits: `Max body ${MAX_BODY_BYTES} bytes. ${RATE_LIMIT_PER_MINUTE} requests per minute per IP.`,
	notes: 'Input is processed in memory and not stored. The map is returned, never retained.',
	example:
		'curl -X POST https://hirokuwana.com/api/text/redact -H "content-type: text/plain" --data-binary @notes.txt',
	openapi: 'https://hirokuwana.com/api/openapi.json'
};

export const GET: RequestHandler = () => jsonResponse(USAGE);

export const OPTIONS: RequestHandler = () => corsPreflight();

function parseTypes(value: unknown): RedactionType[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const allowed = new Set<string>(REDACTION_TYPES);
	const picked = value.filter(
		(item): item is RedactionType => typeof item === 'string' && allowed.has(item)
	);
	return picked.length > 0 ? picked : undefined;
}

function parseTerms(value: unknown): string[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const picked = value.filter(
		(item): item is string => typeof item === 'string' && item.trim().length > 0
	);
	return picked.length > 0 ? picked.slice(0, 200) : undefined;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let ip = 'unknown';
	try {
		ip = getClientAddress();
	} catch {
		// keep the shared 'unknown' bucket when the address is unavailable
	}
	const limited = checkRateLimit(ip);
	if (limited) return limited;

	const raw = await request.text();
	if (raw.length > MAX_BODY_BYTES) {
		return jsonResponse(
			{ ok: false, error: `Body too large. The limit is ${MAX_BODY_BYTES} bytes.` },
			413
		);
	}

	let text = raw;
	let types: RedactionType[] | undefined;
	let terms: string[] | undefined;

	if ((request.headers.get('content-type') ?? '').includes('application/json')) {
		let parsed: Record<string, unknown>;
		try {
			parsed = JSON.parse(raw) as Record<string, unknown>;
		} catch {
			return jsonResponse({ ok: false, error: 'Body is not valid JSON.' }, 400);
		}
		if (typeof parsed.text !== 'string') {
			return jsonResponse(
				{ ok: false, error: 'JSON body must contain a string field "text".' },
				400
			);
		}
		text = parsed.text;
		types = parseTypes(parsed.types);
		terms = parseTerms(parsed.terms);
	}

	if (!text.trim()) {
		return jsonResponse(
			{ ok: false, error: 'Body is empty. Send raw text or {"text": "..."}.' },
			400
		);
	}

	const result = redact(text, { types, terms });

	const counts: Record<string, number> = {};
	for (const match of result.matches) {
		counts[match.type] = (counts[match.type] ?? 0) + 1;
	}

	return jsonResponse({ ok: true, text: result.text, map: result.map, counts });
};
