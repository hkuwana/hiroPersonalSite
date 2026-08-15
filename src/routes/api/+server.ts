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
			'Small public utilities for calendar (.ics) and contact (.vcf) files. No auth, no storage. Each endpoint answers GET with its own usage description.',
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
			}
		]
	});

export const OPTIONS: RequestHandler = () => corsPreflight();
