import type { RequestHandler } from './$types';
import { splitVcf } from '$lib/tools/vcf';
import { corsPreflight, jsonResponse, readToolInput } from '$lib/server/api';

export const prerender = false;

const USAGE = {
	endpoint: 'POST /api/vcf/split',
	accepts: [
		'text/vcard or text/plain: the raw .vcf content as the request body',
		'application/json: {"vcf": "<raw .vcf content>"}'
	],
	returns:
		'JSON { ok, count, contacts: [{ fn, email, tel, org, vcf }] }. Each "vcf" is one normalized single-contact vCard (CRLF, FN and N guaranteed).',
	notes: 'Input is processed in memory and not stored.',
	example: 'curl -X POST https://hirokuwana.com/api/vcf/split --data-binary @contacts.vcf'
};

export const GET: RequestHandler = () => jsonResponse(USAGE);

export const OPTIONS: RequestHandler = () => corsPreflight();

export const POST: RequestHandler = async ({ request }) => {
	const input = await readToolInput(request, 'vcf');
	if (input instanceof Response) return input;

	if (!input.trim()) {
		return jsonResponse(
			{ ok: false, error: 'Body is empty. Send raw .vcf text or {"vcf": "..."}.' },
			400
		);
	}

	const contacts = splitVcf(input);
	return jsonResponse({ ok: true, count: contacts.length, contacts });
};
