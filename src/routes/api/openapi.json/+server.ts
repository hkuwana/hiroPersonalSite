import type { RequestHandler } from './$types';
import { corsPreflight, jsonResponse, RATE_LIMIT_PER_MINUTE } from '$lib/server/api';
import { REDACTION_TYPES } from '$lib/tools/redact';
import { CLEAN_TYPES } from '$lib/tools/clean';
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
		description: `Small public utilities for calendar (.ics) and contact (.vcf) files, and for cleaning and redacting text before it reaches a model. No auth. Input is processed in memory and not stored. Rate limit: ${RATE_LIMIT_PER_MINUTE} requests per minute per IP. Max body: 2 MB.`,
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
		},
		'/api/text/redact': {
			post: {
				operationId: 'redactText',
				summary: 'Replace personal data in text with reversible placeholders',
				description:
					'Detects only what a checksum or a fixed prefix confirms: card numbers (Luhn), IBANs (mod-97), Japan My Number (check digit), API keys and JWTs by prefix, emails, phone numbers, IP addresses, URLs with a query string, and postal codes. Person names are never detected, because no pattern finds a name without guessing; pass them in "terms" instead. One value always maps to one placeholder, so the text stays coherent for the model. There is no restore endpoint: reversal needs the original values and belongs in the browser.',
				requestBody: {
					required: true,
					content: {
						'text/plain': { schema: { type: 'string' } },
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									text: { type: 'string' },
									types: {
										type: 'array',
										description: 'Types to look for. Defaults to all of them.',
										items: {
											type: 'string',
											enum: [...REDACTION_TYPES]
										}
									},
									terms: {
										type: 'array',
										description:
											'Exact strings to hide, such as people and company names. Matched case-insensitively. Maximum 200.',
										items: { type: 'string' }
									}
								},
								required: ['text']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Redacted text plus the map needed to reverse it.',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										ok: { type: 'boolean' },
										text: { type: 'string', description: 'The text with placeholders in place.' },
										map: {
											type: 'object',
											description:
												'Placeholder to original value, for example {"[EMAIL_1]": "a@b.com"}. Returned once and never stored.',
											additionalProperties: { type: 'string' }
										},
										counts: {
											type: 'object',
											description: 'Number of replacements per type.',
											additionalProperties: { type: 'integer' }
										}
									},
									required: ['ok', 'text', 'map', 'counts']
								}
							}
						}
					},
					'400': { description: 'Empty or malformed body.' },
					'413': { description: 'Body over 2 MB.' },
					'429': { description: 'Rate limit exceeded. Respect Retry-After.' }
				}
			}
		},
		'/api/text/clean': {
			post: {
				operationId: 'cleanText',
				summary: 'Remove characters that hide inside text',
				description:
					'Removes zero-width marks, text-direction overrides (Trojan Source), Unicode tag characters, control characters, private-use characters, look-alike spaces, and look-alike letters. Run it before untrusted text reaches a model: a pasted page, contract, or job description can carry an instruction a person cannot see and a model still obeys. Restraint is deliberate. A zero-width joiner between emoji, a zero-width non-joiner in a joining script, and U+3000 (the ordinary Japanese space) are left alone. A look-alike letter is replaced only inside a word that also holds a Latin letter, so Cyrillic and Greek words survive intact.',
				requestBody: {
					required: true,
					content: {
						'text/plain': { schema: { type: 'string' } },
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									text: { type: 'string' },
									types: {
										type: 'array',
										description: 'Categories to act on. Defaults to all of them.',
										items: { type: 'string', enum: [...CLEAN_TYPES] }
									}
								},
								required: ['text']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Cleaned text plus what was found.',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										ok: { type: 'boolean' },
										text: { type: 'string', description: 'The cleaned text.' },
										findings: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													type: { type: 'string', enum: [...CLEAN_TYPES] },
													value: { type: 'string' },
													codepoints: {
														type: 'array',
														items: { type: 'string' },
														description: 'For example ["U+200B"].'
													},
													start: { type: 'integer' },
													end: { type: 'integer' },
													decoded: {
														type: 'string',
														description:
															'Present on a TAG finding: the ASCII text the hidden run spells.'
													}
												},
												required: ['type', 'value', 'codepoints', 'start', 'end']
											}
										},
										counts: {
											type: 'object',
											description: 'Number of findings per category.',
											additionalProperties: { type: 'integer' }
										}
									},
									required: ['ok', 'text', 'findings', 'counts']
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
