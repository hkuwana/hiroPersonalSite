/**
 * Reversible redaction, shared by the /tools/safe-paste page and the public
 * /api/text/redact endpoint. Pure functions, no DOM.
 *
 * Design rule: only patterns a checksum or a fixed prefix confirms. Anything
 * that needs a guess (person names, plain five-digit postal codes) is left to
 * the caller's own term list. A redactor that guesses fails silently, and a
 * silent miss is the exact harm this module exists to prevent.
 */

export type RedactionType =
	| 'EMAIL'
	| 'PHONE'
	| 'CARD'
	| 'IBAN'
	| 'MYNUMBER'
	| 'SECRET'
	| 'IP'
	| 'URL'
	| 'POSTAL'
	| 'TERM'
	| 'LITERAL';

export type Match = {
	type: RedactionType;
	value: string;
	start: number;
	end: number;
};

/** Placeholder -> original value. */
export type RedactionMap = Record<string, string>;

export type RedactOptions = {
	/** Types to look for. Defaults to every type except TERM. */
	types?: RedactionType[];
	/** Exact strings the caller knows are sensitive, such as names. */
	terms?: string[];
};

export type RedactResult = {
	text: string;
	map: RedactionMap;
	matches: Match[];
};

export type RestoreResult = {
	text: string;
	/** Placeholders that were in the map but absent from the text. */
	missing: string[];
};

/** Every type a caller can switch on, in the order the UI lists them. */
export const REDACTION_TYPES: RedactionType[] = [
	'EMAIL',
	'PHONE',
	'CARD',
	'IBAN',
	'MYNUMBER',
	'SECRET',
	'IP',
	'URL',
	'POSTAL'
];

/** Tie-break order when two matches cover the same span. Lower wins. */
const TYPE_PRIORITY: Record<RedactionType, number> = {
	TERM: 0,
	LITERAL: 1,
	SECRET: 2,
	CARD: 3,
	IBAN: 4,
	MYNUMBER: 5,
	EMAIL: 6,
	URL: 7,
	PHONE: 8,
	IP: 9,
	POSTAL: 10
};

const PATTERNS: { type: RedactionType; re: RegExp; verify?: (value: string) => boolean }[] = [
	// Placeholder-shaped text already in the input. Captured so a round trip
	// cannot corrupt it, and restored last by the single-pass scan.
	{ type: 'LITERAL', re: /\[[A-Z][A-Z0-9]*_\d+\]/g },

	{ type: 'SECRET', re: /sk-ant-[A-Za-z0-9_-]{8,}/g },
	{ type: 'SECRET', re: /\bsk-[A-Za-z0-9]{16,}\b/g },
	{ type: 'SECRET', re: /\bghp_[A-Za-z0-9]{20,}\b/g },
	{ type: 'SECRET', re: /\bAKIA[A-Z0-9]{16}\b/g },
	{ type: 'SECRET', re: /\bAIza[A-Za-z0-9_-]{35}\b/g },
	{ type: 'SECRET', re: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g },

	{ type: 'CARD', re: /\b(?:\d[ -]?){12,18}\d\b/g, verify: isLuhnValid },
	{ type: 'IBAN', re: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, verify: isIbanValid },
	{ type: 'MYNUMBER', re: /\b\d{12}\b/g, verify: isMyNumberValid },

	{ type: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
	{ type: 'URL', re: /https?:\/\/[^\s<>"']+\?[^\s<>"']*/g },

	{ type: 'PHONE', re: /\+[1-9]\d{7,14}\b/g },
	{ type: 'PHONE', re: /\b0\d{1,4}-\d{1,4}-\d{4}\b/g },
	{ type: 'PHONE', re: /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },

	{ type: 'IP', re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, verify: isIpv4Valid },
	// IPv6 only in its unambiguous forms: eight full groups, or a "::" run.
	{ type: 'IP', re: /\b(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}\b/g },
	{ type: 'IP', re: /(?:\b[0-9A-Fa-f]{1,4}:){1,7}:(?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?/g },

	{ type: 'POSTAL', re: /〒\s?\d{3}-\d{4}/g },
	{ type: 'POSTAL', re: /\b\d{5}-\d{4}\b/g }
];

function isLuhnValid(value: string): boolean {
	const digits = value.replace(/[^\d]/g, '');
	if (digits.length < 13 || digits.length > 19) return false;

	let sum = 0;
	let double = false;
	for (let i = digits.length - 1; i >= 0; i -= 1) {
		let digit = Number(digits[i]);
		if (double) {
			digit *= 2;
			if (digit > 9) digit -= 9;
		}
		sum += digit;
		double = !double;
	}
	return sum % 10 === 0;
}

function isIbanValid(value: string): boolean {
	if (value.length < 15 || value.length > 34) return false;

	const rearranged = value.slice(4) + value.slice(0, 4);
	let remainder = 0;
	for (const char of rearranged) {
		const chunk = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
		for (const digit of chunk) {
			remainder = (remainder * 10 + Number(digit)) % 97;
		}
	}
	return remainder === 1;
}

/**
 * Japan's individual number check digit. The first eleven digits are the body,
 * the twelfth is the check digit.
 */
function isMyNumberValid(value: string): boolean {
	let sum = 0;
	for (let n = 1; n <= 11; n += 1) {
		const digit = Number(value[11 - n]);
		const weight = n <= 6 ? n + 1 : n - 5;
		sum += digit * weight;
	}
	const remainder = sum % 11;
	const check = remainder <= 1 ? 0 : 11 - remainder;
	return check === Number(value[11]);
}

function isIpv4Valid(value: string): boolean {
	return value.split('.').every((part) => Number(part) <= 255);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Longest match wins. Equal spans fall back to TYPE_PRIORITY. */
function resolveOverlaps(matches: Match[]): Match[] {
	const sorted = [...matches].sort((a, b) => {
		if (a.start !== b.start) return a.start - b.start;
		const spanA = a.end - a.start;
		const spanB = b.end - b.start;
		if (spanA !== spanB) return spanB - spanA;
		return TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
	});

	const kept: Match[] = [];
	let consumedTo = -1;
	for (const match of sorted) {
		if (match.start < consumedTo) continue;
		kept.push(match);
		consumedTo = match.end;
	}
	return kept;
}

export function detect(text: string, options: RedactOptions = {}): Match[] {
	const enabled = new Set<RedactionType>(options.types ?? REDACTION_TYPES);
	enabled.add('LITERAL');

	const found: Match[] = [];

	for (const { type, re, verify } of PATTERNS) {
		if (!enabled.has(type)) continue;
		for (const hit of text.matchAll(re)) {
			const value = hit[0];
			if (verify && !verify(value)) continue;
			found.push({ type, value, start: hit.index, end: hit.index + value.length });
		}
	}

	// Longest terms first so "Acme Corp" beats "Acme" on the same span.
	const terms = [...(options.terms ?? [])].filter(Boolean).sort((a, b) => b.length - a.length);
	for (const term of terms) {
		const re = new RegExp(escapeRegExp(term), 'gi');
		for (const hit of text.matchAll(re)) {
			found.push({
				type: 'TERM',
				value: hit[0],
				start: hit.index,
				end: hit.index + hit[0].length
			});
		}
	}

	return resolveOverlaps(found);
}

export function redact(text: string, options: RedactOptions = {}): RedactResult {
	const matches = detect(text, options);
	const map: RedactionMap = {};
	const assigned = new Map<string, string>();
	const counters = new Map<RedactionType, number>();

	let out = '';
	let cursor = 0;
	for (const match of matches) {
		// Key on type and exact surface form, so one value keeps one placeholder
		// and the round trip returns the casing the author used.
		const key = `${match.type}:${match.value}`;
		let placeholder = assigned.get(key);
		if (!placeholder) {
			const next = (counters.get(match.type) ?? 0) + 1;
			counters.set(match.type, next);
			placeholder = `[${match.type}_${next}]`;
			assigned.set(key, placeholder);
			map[placeholder] = match.value;
		}
		out += text.slice(cursor, match.start) + placeholder;
		cursor = match.end;
	}
	out += text.slice(cursor);

	return { text: out, map, matches };
}

/** Tolerates the casing and spacing a model may introduce, such as "[ email_1 ]". */
const PLACEHOLDER_RE = /\[\s*([A-Za-z][A-Za-z0-9]*_\d+)\s*\]/g;

export function restore(text: string, map: RedactionMap): RestoreResult {
	const seen = new Set<string>();

	// One pass, so a restored value can never be rescanned and replaced again.
	const out = text.replace(PLACEHOLDER_RE, (whole, name: string) => {
		const key = `[${name.toUpperCase()}]`;
		if (!(key in map)) return whole;
		seen.add(key);
		return map[key];
	});

	const missing = Object.keys(map).filter((key) => !seen.has(key));
	return { text: out, missing };
}
