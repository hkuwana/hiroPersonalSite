import type { RequestHandler } from './$types';
import { clean, CLEAN_TYPES, type CleanType } from '$lib/tools/clean';
import {
	checkRateLimit,
	corsPreflight,
	jsonResponse,
	MAX_BODY_BYTES,
	RATE_LIMIT_PER_MINUTE
} from '$lib/server/api';

export const prerender = false;

const USAGE = {
	endpoint: 'POST /api/text/clean',
	purpose:
		'Remove characters that hide inside text. Useful before untrusted text reaches a model: a pasted page or document can carry instructions a person cannot see and a model still obeys.',
	accepts: [
		'text/plain: the raw text as the request body, with every category enabled',
		'application/json: {"text": "...", "types": ["TAG"]}'
	],
	returns:
		'JSON { ok, text, findings, counts }. Each finding carries its type, codepoints, and offsets. A TAG finding also carries "decoded": the ASCII the hidden run spells.',
	types: CLEAN_TYPES,
	keeps:
		'A zero width joiner between emoji, a zero width non-joiner in a joining script, and U+3000 (the ordinary Japanese space) are left alone. A homoglyph is replaced only inside a word that also holds a Latin letter, so Cyrillic and Greek words survive.',
	limits: `Max body ${MAX_BODY_BYTES} bytes. ${RATE_LIMIT_PER_MINUTE} requests per minute per IP.`,
	notes: 'Input is processed in memory and not stored.',
	example:
		'curl -X POST https://hirokuwana.com/api/text/clean -H "content-type: text/plain" --data-binary @pasted.txt',
	openapi: 'https://hirokuwana.com/api/openapi.json'
};

export const GET: RequestHandler = () => jsonResponse(USAGE);

export const OPTIONS: RequestHandler = () => corsPreflight();

function parseTypes(value: unknown): CleanType[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const allowed = new Set<string>(CLEAN_TYPES);
	const picked = value.filter(
		(item): item is CleanType => typeof item === 'string' && allowed.has(item)
	);
	return picked.length > 0 ? picked : undefined;
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
	let types: CleanType[] | undefined;

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
	}

	if (!text) {
		return jsonResponse(
			{ ok: false, error: 'Body is empty. Send raw text or {"text": "..."}.' },
			400
		);
	}

	const result = clean(text, { types });
	return jsonResponse({
		ok: true,
		text: result.text,
		findings: result.findings,
		counts: result.counts
	});
};
