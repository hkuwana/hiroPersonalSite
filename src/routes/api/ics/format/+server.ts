import type { RequestHandler } from './$types';
import { formatIcs } from '$lib/tools/ics';
import { CORS_HEADERS, corsPreflight, jsonResponse, readToolInput } from '$lib/server/api';

export const prerender = false;

const USAGE = {
	endpoint: 'POST /api/ics/format',
	accepts: [
		'text/calendar or text/plain: the raw .ics content as the request body',
		'application/json: {"ics": "<raw .ics content>"}'
	],
	returns:
		'JSON { ok, issues: [{ kind, message }], events: [{ summary, start, end, rrule? }], ics }. "ics" is the repaired calendar (CRLF, folded, UID and DTSTAMP guaranteed).',
	options: 'Append ?output=ics to receive the repaired calendar as text/calendar instead of JSON.',
	notes: 'Input is processed in memory and not stored.',
	example: 'curl -X POST https://hirokuwana.com/api/ics/format --data-binary @calendar.ics'
};

export const GET: RequestHandler = () => jsonResponse(USAGE);

export const OPTIONS: RequestHandler = () => corsPreflight();

export const POST: RequestHandler = async ({ request, url }) => {
	const input = await readToolInput(request, 'ics');
	if (input instanceof Response) return input;

	if (!input.trim()) {
		return jsonResponse(
			{ ok: false, error: 'Body is empty. Send raw .ics text or {"ics": "..."}.' },
			400
		);
	}

	const result = formatIcs(input);
	const hasError = result.issues.some((issue) => issue.kind === 'error');

	if (url.searchParams.get('output') === 'ics') {
		if (!result.ics) {
			return jsonResponse({ ok: false, issues: result.issues }, 422);
		}
		return new Response(result.ics + '\r\n', {
			status: 200,
			headers: { ...CORS_HEADERS, 'Content-Type': 'text/calendar; charset=utf-8' }
		});
	}

	return jsonResponse({
		ok: !hasError,
		issues: result.issues,
		events: result.events,
		ics: result.ics
	});
};
