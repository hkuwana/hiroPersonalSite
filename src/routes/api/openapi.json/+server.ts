import type { RequestHandler } from './$types';
import { corsPreflight, jsonResponse, RATE_LIMIT_PER_MINUTE } from '$lib/server/api';
import { SITE } from '$data/constants';

export const prerender = false;

const ISSUE_SCHEMA = {
	type: 'object',
	properties: {
		kind: { type: 'string', enum: ['error', 'warning', 'fixed'] },
		message: { type: 'string' }
	},
	required: ['kind', 'message']
} as const;

const SPEC = {
	openapi: '3.1.0',
	info: {
		title: 'hirokuwana.com tool API',
		version: '1.0.0',
		description: `Small public utilities for calendar (.ics) and contact (.vcf) files. No auth. Input is processed in memory and not stored. Rate limit: ${RATE_LIMIT_PER_MINUTE} requests per minute per IP. Max body: 2 MB.`,
		contact: { name: 'Hiro Kuwana', url: SITE.url }
	},
	servers: [{ url: SITE.url }],
	paths: {
		'/api/ics/format': {
			post: {
				operationId: 'formatIcs',
				summary: 'Validate and repair an ICS calendar (RFC 5545)',
				description:
					'Fixes line endings, folding, and missing VERSION, PRODID, UID, and DTSTAMP. Reports unrepairable problems as issues with kind "error".',
				parameters: [
					{
						name: 'output',
						in: 'query',
						required: false,
						schema: { type: 'string', enum: ['ics'] },
						description:
							'Set to "ics" to receive the repaired calendar as text/calendar instead of JSON.'
					}
				],
				requestBody: {
					required: true,
					content: {
						'text/calendar': { schema: { type: 'string' } },
						'text/plain': { schema: { type: 'string' } },
						'application/json': {
							schema: {
								type: 'object',
								properties: { ics: { type: 'string' } },
								required: ['ics']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Result. ok is false when at least one issue has kind "error".',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										ok: { type: 'boolean' },
										issues: { type: 'array', items: ISSUE_SCHEMA },
										events: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													summary: { type: 'string' },
													start: { type: 'string' },
													end: { type: 'string' },
													rrule: { type: 'string' }
												},
												required: ['summary', 'start', 'end']
											}
										},
										ics: { type: 'string', description: 'Repaired calendar, CRLF, folded.' }
									},
									required: ['ok', 'issues', 'events', 'ics']
								}
							},
							'text/calendar': { schema: { type: 'string' } }
						}
					},
					'400': { description: 'Empty or malformed body.' },
					'413': { description: 'Body over 2 MB.' },
					'429': { description: 'Rate limit exceeded. Respect Retry-After.' }
				}
			}
		},
		'/api/vcf/split': {
			post: {
				operationId: 'splitVcf',
				summary: 'Split a multi-contact VCF into single-contact vCards',
				description:
					'Splits on BEGIN:VCARD / END:VCARD, repairs missing FN and N fields, and returns one normalized vCard per contact.',
				requestBody: {
					required: true,
					content: {
						'text/vcard': { schema: { type: 'string' } },
						'text/plain': { schema: { type: 'string' } },
						'application/json': {
							schema: {
								type: 'object',
								properties: { vcf: { type: 'string' } },
								required: ['vcf']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Parsed contacts.',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										ok: { type: 'boolean' },
										count: { type: 'integer' },
										contacts: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													fn: { type: 'string' },
													email: { type: 'string' },
													tel: { type: 'string' },
													org: { type: 'string' },
													vcf: {
														type: 'string',
														description: 'One normalized single-contact vCard, CRLF.'
													}
												},
												required: ['fn', 'email', 'tel', 'org', 'vcf']
											}
										}
									},
									required: ['ok', 'count', 'contacts']
								}
							}
						}
					},
					'400': { description: 'Empty or malformed body.' },
					'413': { description: 'Body over 2 MB.' },
					'429': { description: 'Rate limit exceeded. Respect Retry-After.' }
				}
			}
		}
	}
} as const;

export const GET: RequestHandler = () => jsonResponse(SPEC);

export const OPTIONS: RequestHandler = () => corsPreflight();
