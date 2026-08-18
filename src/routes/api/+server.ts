import type { RequestHandler } from './$types';
import {
	corsPreflight,
	jsonResponse,
	RATE_LIMIT_PER_MINUTE,
	MAX_BODY_BYTES
} from '$lib/server/api';
import { SITE } from '$data/constants';

export const prerender = false;

/** Machine-readable index of the tool API, for agents that land on /api. */
export const GET: RequestHandler = () =>
	jsonResponse({
		name: 'hirokuwana.com tool API',
		description:
			'Small public utilities for calendar (.ics) and contact (.vcf) files, and for cleaning and redacting text before it reaches a model. No auth, no storage. Each endpoint answers GET with its own usage description.',
		openapi: `${SITE.url}/api/openapi.json`,
		llms: `${SITE.url}/llms.txt`,
		limits: {
			maxBodyBytes: MAX_BODY_BYTES,
			requestsPerMinutePerIp: RATE_LIMIT_PER_MINUTE
		},
		endpoints: [
			{
				method: 'POST',
				path: '/api/ics/format',
				summary:
					'Validate and repair an ICS calendar (RFC 5545). Returns issues, parsed events, and the cleaned ics. Add ?output=ics for raw text/calendar.'
			},
			{
				method: 'POST',
				path: '/api/vcf/split',
				summary:
					'Split a multi-contact VCF into normalized single-contact vCards. Returns fn, email, tel, org, and the vcf block per contact.'
			},
			{
				method: 'POST',
				path: '/api/text/redact',
				summary:
					'Replace personal data in text with reversible placeholders such as [EMAIL_1]. Detects emails, phones, card numbers (Luhn), IBANs (mod-97), Japan My Number, API keys, IPs, and query URLs. Person names are not detected: pass them in "terms". Returns the redacted text and the placeholder map.'
			},
			{
				method: 'POST',
				path: '/api/text/clean',
				summary:
					'Remove characters that hide inside text: zero-width marks, text-direction overrides, Unicode tag characters, control characters, private-use characters, look-alike spaces, and look-alike letters. Run it before untrusted text reaches a model, because a hidden instruction can travel this way. A tag finding also reports the ASCII it spells.'
			}
		]
	});

export const OPTIONS: RequestHandler = () => corsPreflight();
