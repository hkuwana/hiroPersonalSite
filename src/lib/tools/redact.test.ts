import { describe, expect, test } from 'vitest';
import { detect, redact, restore } from './redact';

describe('placeholders', () => {
	test('replaces an email address with a typed placeholder', () => {
		expect(redact('Write to hiro@trykaiwa.com today.').text).toBe('Write to [EMAIL_1] today.');
	});

	test('gives one value the same placeholder every time it appears', () => {
		const result = redact('hiro@trykaiwa.com told hiro@trykaiwa.com to wait.');

		expect(result.text).toBe('[EMAIL_1] told [EMAIL_1] to wait.');
		expect(Object.keys(result.map)).toHaveLength(1);
	});

	test('numbers each type from one', () => {
		const result = redact('a@b.com and c@d.com from 192.168.1.1');

		expect(result.text).toBe('[EMAIL_1] and [EMAIL_2] from [IP_1]');
	});
});

describe('detection by checksum', () => {
	test('redacts a card number that passes the Luhn check', () => {
		expect(redact('card 4111111111111111 ok').text).toBe('card [CARD_1] ok');
	});

	test('leaves a digit run that fails the Luhn check', () => {
		expect(redact('order 4111111111111112 ok').text).toBe('order 4111111111111112 ok');
	});

	test('redacts a card number written in spaced groups', () => {
		expect(redact('card 4111 1111 1111 1111 ok').text).toBe('card [CARD_1] ok');
	});

	test('redacts an IBAN that passes the mod-97 check', () => {
		expect(redact('pay GB82WEST12345698765432 now').text).toBe('pay [IBAN_1] now');
	});

	test('leaves an IBAN that fails the mod-97 check', () => {
		expect(redact('pay GB82WEST12345698765433 now').text).toBe('pay GB82WEST12345698765433 now');
	});

	// Body 12345678901 -> weighted sum 212, 212 mod 11 = 3, check digit 11 - 3 = 8.
	test('redacts a My Number that passes its check digit', () => {
		expect(redact('番号 123456789018 です').text).toBe('番号 [MYNUMBER_1] です');
	});

	test('leaves a 12-digit run whose check digit is wrong', () => {
		expect(redact('番号 123456789017 です').text).toBe('番号 123456789017 です');
	});
});

describe('detection by prefix', () => {
	test.each([
		['sk-ant-api03-AbCdEfGhIjKlMnOpQrSt', 'an Anthropic key'],
		['ghp_AbCdEfGhIjKlMnOpQrStUvWxYz0123', 'a GitHub token'],
		['AKIAIOSFODNN7EXAMPLE', 'an AWS access key id'],
		['eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln', 'a JWT']
	])('redacts %s (%s)', (secret) => {
		expect(redact(`token ${secret} end`).text).toBe('token [SECRET_1] end');
	});
});

describe('detection by shape', () => {
	test('redacts an E.164 phone number', () => {
		expect(redact('call +818012345678 now').text).toBe('call [PHONE_1] now');
	});

	test('redacts a separated Japanese phone number', () => {
		expect(redact('call 03-1234-5678 now').text).toBe('call [PHONE_1] now');
	});

	test('leaves a bare digit run that has no phone shape', () => {
		expect(redact('quantity 12345 units').text).toBe('quantity 12345 units');
	});

	test('redacts an IPv4 address', () => {
		expect(redact('host 192.168.1.1 up').text).toBe('host [IP_1] up');
	});

	test('redacts a compressed IPv6 address', () => {
		expect(redact('host 2001:db8::1 up').text).toBe('host [IP_1] up');
	});

	test('leaves a clock time that looks like hex groups', () => {
		expect(redact('ran at 12:34:56 today').text).toBe('ran at 12:34:56 today');
	});

	test('redacts a URL that carries a query string', () => {
		expect(redact('open https://x.test/a?token=abc123 now').text).toBe('open [URL_1] now');
	});

	test('leaves a URL that carries no query string', () => {
		expect(redact('open https://x.test/a now').text).toBe('open https://x.test/a now');
	});

	test('redacts a Japanese postal code', () => {
		expect(redact('住所 〒150-0001 東京').text).toBe('住所 [POSTAL_1] 東京');
	});
});

describe('custom terms', () => {
	test('redacts a term the user supplies', () => {
		const result = redact('Hiro joined Kaiwa.', { terms: ['Hiro', 'Kaiwa'] });

		expect(result.text).toBe('[TERM_1] joined [TERM_2].');
	});

	test('matches a term regardless of case', () => {
		expect(redact('hiro and Hiro', { terms: ['Hiro'] }).text).toBe('[TERM_1] and [TERM_2]');
	});

	test('prefers the longest term when two terms overlap', () => {
		expect(redact('Acme Corp ships', { terms: ['Acme', 'Acme Corp'] }).text).toBe('[TERM_1] ships');
	});

	test('treats a term with regex characters as literal text', () => {
		expect(redact('build a.b now', { terms: ['a.b'] }).text).toBe('build [TERM_1] now');
		expect(redact('build axb now', { terms: ['a.b'] }).text).toBe('build axb now');
	});
});

describe('overlapping matches', () => {
	test('keeps the longest match when an email sits inside a URL', () => {
		const result = redact('see https://x.test/?to=a@b.com here');

		expect(result.text).toBe('see [URL_1] here');
	});
});

describe('options', () => {
	test('skips a type the caller turns off', () => {
		const result = redact('a@b.com at 192.168.1.1', { types: ['IP'] });

		expect(result.text).toBe('a@b.com at [IP_1]');
	});
});

describe('restore', () => {
	test('returns the original text after a round trip', () => {
		const original = 'Write to hiro@trykaiwa.com or call +818012345678.';
		const step = redact(original);

		expect(restore(step.text, step.map).text).toBe(original);
	});

	test('round trips text that already contains placeholder-shaped tokens', () => {
		const original = 'The template uses [EMAIL_1] and mine is real@x.test.';
		const step = redact(original);

		expect(step.text).not.toContain('real@x.test');
		expect(restore(step.text, step.map).text).toBe(original);
	});

	test('restores a placeholder the model rewrote in lower case', () => {
		const step = redact('mail a@b.com');

		expect(restore('mail [email_1]', step.map).text).toBe('mail a@b.com');
	});

	test('restores a placeholder the model padded with spaces', () => {
		const step = redact('mail a@b.com');

		expect(restore('mail [ EMAIL_1 ]', step.map).text).toBe('mail a@b.com');
	});

	test('does not confuse a placeholder with a longer numbered one', () => {
		const map = { '[EMAIL_1]': 'one@x.test', '[EMAIL_11]': 'eleven@x.test' };

		expect(restore('[EMAIL_11] and [EMAIL_1]', map).text).toBe('eleven@x.test and one@x.test');
	});

	test('reports a placeholder the model dropped', () => {
		const step = redact('mail a@b.com and c@d.com');

		expect(restore('mail [EMAIL_1] only', step.map).missing).toEqual(['[EMAIL_2]']);
	});
});

describe('detect', () => {
	test('reports the offsets of each match', () => {
		expect(detect('hi a@b.com')).toEqual([{ type: 'EMAIL', value: 'a@b.com', start: 3, end: 10 }]);
	});

	test('finds nothing in text that holds no personal data', () => {
		expect(detect('The build finished without errors.')).toEqual([]);
	});
});
