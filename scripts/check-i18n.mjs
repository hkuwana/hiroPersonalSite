#!/usr/bin/env node
/**
 * i18n drift checker — run via `pnpm check:i18n`.
 *
 * Fails if any locale is missing keys from en.json (the source of truth),
 * or if any locale has values identical to en.json (placeholder-English smell).
 *
 * Existed because Claude once shipped 12 footer keys as English placeholders
 * across ja/es/zh and nobody noticed until a user visited /ja/.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(__dirname, '../messages');

const SOURCE_LOCALE = 'en';
const TARGET_LOCALES = ['ja', 'es', 'zh'];

// Keys allowed to match English because they are brand/proper-noun/code-like.
const ALLOWED_IDENTICAL_KEYS = new Set([
	'$schema',
	'kaiwa_tagline', // Brand tagline — English is intentional on some locales
	'kaiwa_description'
]);

function load(locale) {
	const path = resolve(messagesDir, `${locale}.json`);
	return JSON.parse(readFileSync(path, 'utf8'));
}

function main() {
	const source = load(SOURCE_LOCALE);
	const sourceKeys = Object.keys(source).filter((k) => !k.startsWith('$'));

	let failures = 0;

	for (const locale of TARGET_LOCALES) {
		const target = load(locale);
		const targetKeys = Object.keys(target).filter((k) => !k.startsWith('$'));

		const missing = sourceKeys.filter((k) => !(k in target));
		const extra = targetKeys.filter((k) => !(k in source));
		const placeholders = sourceKeys.filter(
			(k) =>
				!ALLOWED_IDENTICAL_KEYS.has(k) &&
				k in target &&
				target[k] === source[k] &&
				// Don't flag short non-translatable tokens like single letters
				typeof target[k] === 'string' &&
				target[k].length > 3
		);

		if (missing.length === 0 && extra.length === 0 && placeholders.length === 0) {
			console.log(`✓ ${locale}: ${targetKeys.length} keys, no drift.`);
			continue;
		}

		failures += 1;
		console.log(`\n✗ ${locale}:`);
		if (missing.length) {
			console.log(`  Missing ${missing.length} keys:`);
			for (const k of missing) console.log(`    - ${k}`);
		}
		if (extra.length) {
			console.log(`  Extra ${extra.length} keys (not in en.json):`);
			for (const k of extra) console.log(`    - ${k}`);
		}
		if (placeholders.length) {
			console.log(`  Placeholder English (${placeholders.length} keys match en.json verbatim):`);
			for (const k of placeholders) {
				const preview = String(source[k]).slice(0, 60);
				console.log(`    - ${k}: "${preview}${source[k].length > 60 ? '…' : ''}"`);
			}
		}
	}

	if (failures > 0) {
		console.log(`\n${failures} locale(s) have i18n drift.`);
		process.exit(1);
	}

	console.log(`\nAll ${TARGET_LOCALES.length} locales in sync with ${SOURCE_LOCALE}.json.`);
}

main();
