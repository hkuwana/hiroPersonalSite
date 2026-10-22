/**
 * Removes characters that hide inside text, shared by the /tools/safe-paste
 * page and the public /api/text/clean endpoint. Pure functions, no DOM.
 *
 * Two harms motivate this module. The small one is that a model reads noise.
 * The large one is prompt injection: a pasted job description, contract, or
 * web page can carry instructions a person cannot see and a model still obeys.
 *
 * Cleaning is not redaction. Redaction substitutes a value and reverses.
 * Cleaning deletes a character and does not reverse, so it lives apart from
 * redact.ts.
 *
 * The hard part is restraint. Some invisible characters are correct text:
 * a zero width joiner builds a family emoji, a zero width non-joiner carries
 * meaning in Persian and Devanagari, and U+3000 is an ordinary Japanese space.
 * Each rule below states what it refuses to touch.
 */

export type CleanType = 'ZERO_WIDTH' | 'BIDI' | 'TAG' | 'CONTROL' | 'PUA' | 'SPACE' | 'HOMOGLYPH';

export type Finding = {
	type: CleanType;
	value: string;
	codepoints: string[];
	start: number;
	end: number;
	/** For TAG runs: the ASCII text the run actually spells. */
	decoded?: string;
};

export type CleanOptions = {
	/** Categories to act on. Defaults to every category. */
	types?: CleanType[];
};

export type CleanResult = {
	text: string;
	findings: Finding[];
	counts: Partial<Record<CleanType, number>>;
};

export const CLEAN_TYPES: CleanType[] = [
	'ZERO_WIDTH',
	'BIDI',
	'TAG',
	'CONTROL',
	'PUA',
	'SPACE',
	'HOMOGLYPH'
];

/** Always removed. No script uses these to carry meaning. */
const ZERO_WIDTH = new Set(['​', '﻿', '⁠', '᠎']);

/** Overrides and isolates. The Trojan Source problem. */
const BIDI = new Set([
	'‪',
	'‫',
	'‬',
	'‭',
	'‮',
	'⁦',
	'⁧',
	'⁨',
	'⁩',
	'‎',
	'‏'
]);

/**
 * Confusable spaces, normalized to U+0020. U+3000 is deliberately absent:
 * it is the ordinary full-width space of Japanese text.
 */
const SPACES = new Set([
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' ',
	' '
]);

/** Cyrillic and Greek letters that are visually identical to a Latin one. */
const HOMOGLYPHS: Record<string, string> = {
	а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't',
	у: 'y', х: 'x', і: 'i', ј: 'j', ѕ: 's', А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M',
	Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', Х: 'X', У: 'Y', Ѕ: 'S', І: 'I', Ј: 'J',
	α: 'a', ε: 'e', ο: 'o', ρ: 'p', τ: 't', υ: 'u', ν: 'v', Α: 'A', Β: 'B', Ε: 'E',
	Ζ: 'Z', Η: 'H', Ι: 'I', Κ: 'K', Μ: 'M', Ν: 'N', Ο: 'O', Ρ: 'P', Τ: 'T', Υ: 'Y',
	Χ: 'X'
};

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const JOINING_SCRIPT_RE = /[\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Hebrew}]/u;
const LATIN_RE = /[A-Za-z]/;
const WORD_RE = /[\p{L}\p{M}\p{N}]+/gu;

function codepoint(char: string): string {
	return `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
}

/** U+E0000 + n encodes ASCII n. The channel used to smuggle instructions. */
function isTagChar(code: number): boolean {
	return code >= 0xe0000 && code <= 0xe007f;
}

function isPuaChar(code: number): boolean {
	return (
		(code >= 0xe000 && code <= 0xf8ff) ||
		(code >= 0xf0000 && code <= 0xffffd) ||
		(code >= 0x100000 && code <= 0x10fffd)
	);
}

/** C0 and C1 controls, less the whitespace that ordinary text needs. */
function isControlChar(code: number): boolean {
	if (code === 0x09 || code === 0x0a || code === 0x0d) return false;
	return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
}

/**
 * A zero width joiner is correct between emoji, and a zero width non-joiner is
 * correct in a joining script. Either is suspect anywhere else.
 */
function isMeaningfulJoiner(char: string, before: string, after: string): boolean {
	if (char === '‍') return EMOJI_RE.test(before) || EMOJI_RE.test(after);
	if (char === '‌') return JOINING_SCRIPT_RE.test(before) || JOINING_SCRIPT_RE.test(after);
	return false;
}

/**
 * A homoglyph only counts inside a word that also holds a Latin letter.
 * A word written entirely in Cyrillic is Russian, not an attack.
 */
function findHomoglyphs(text: string): Finding[] {
	const found: Finding[] = [];

	for (const word of text.matchAll(WORD_RE)) {
		const value = word[0];
		if (!LATIN_RE.test(value)) continue;

		for (let i = 0; i < value.length; i += 1) {
			const char = value[i];
			if (!(char in HOMOGLYPHS)) continue;
			const start = word.index + i;
			found.push({
				type: 'HOMOGLYPH',
				value: char,
				codepoints: [codepoint(char)],
				start,
				end: start + 1
			});
		}
	}

	return found;
}

export function scan(text: string, options: CleanOptions = {}): Finding[] {
	const enabled = new Set<CleanType>(options.types ?? CLEAN_TYPES);
	const chars = [...text];
	const found: Finding[] = [];

	// Walk by code point, but record offsets in UTF-16 units so they line up
	// with String.slice and with the textarea selection API.
	let offset = 0;
	let tagRun: { start: number; chars: string[] } | null = null;

	const flushTagRun = () => {
		if (!tagRun) return;
		const value = tagRun.chars.join('');
		found.push({
			type: 'TAG',
			value,
			codepoints: tagRun.chars.map(codepoint),
			start: tagRun.start,
			end: tagRun.start + value.length,
			decoded: tagRun.chars
				.map((c) => String.fromCharCode(c.codePointAt(0)! - 0xe0000))
				.join('')
		});
		tagRun = null;
	};

	for (let i = 0; i < chars.length; i += 1) {
		const char = chars[i];
		const code = char.codePointAt(0)!;
		const width = char.length;

		if (isTagChar(code)) {
			if (enabled.has('TAG')) {
				if (!tagRun) tagRun = { start: offset, chars: [] };
				tagRun.chars.push(char);
				offset += width;
				continue;
			}
		} else {
			flushTagRun();
		}

		const push = (type: CleanType) => {
			found.push({
				type,
				value: char,
				codepoints: [codepoint(char)],
				start: offset,
				end: offset + width
			});
		};

		if (enabled.has('ZERO_WIDTH')) {
			if (ZERO_WIDTH.has(char)) push('ZERO_WIDTH');
			else if (
				(char === '‍' || char === '‌') &&
				!isMeaningfulJoiner(char, chars[i - 1] ?? '', chars[i + 1] ?? '')
			) {
				push('ZERO_WIDTH');
			}
		}
		if (enabled.has('BIDI') && BIDI.has(char)) push('BIDI');
		if (enabled.has('SPACE') && SPACES.has(char)) push('SPACE');
		if (enabled.has('CONTROL') && isControlChar(code)) push('CONTROL');
		if (enabled.has('PUA') && isPuaChar(code)) push('PUA');

		offset += width;
	}

	flushTagRun();

	if (enabled.has('HOMOGLYPH')) found.push(...findHomoglyphs(text));

	return found.sort((a, b) => a.start - b.start);
}

export function clean(text: string, options: CleanOptions = {}): CleanResult {
	const findings = scan(text, options);

	let out = '';
	let cursor = 0;
	for (const finding of findings) {
		out += text.slice(cursor, finding.start);
		if (finding.type === 'SPACE') out += ' ';
		else if (finding.type === 'HOMOGLYPH') out += HOMOGLYPHS[finding.value];
		cursor = finding.end;
	}
	out += text.slice(cursor);

	const counts: Partial<Record<CleanType, number>> = {};
	for (const finding of findings) counts[finding.type] = (counts[finding.type] ?? 0) + 1;

	return { text: out, findings, counts };
}
