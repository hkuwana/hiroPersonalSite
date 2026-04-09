#!/usr/bin/env node
/**
 * i18n Drift Checker
 *
 * Compares all locale files against en.json (source of truth).
 * Reports: missing keys, extra keys, and length-variance warnings.
 *
 * Exit 0  — all locales in sync (warnings are non-fatal)
 * Exit 1  — one or more locales have missing keys
 *
 * Usage:
 *   node scripts/i18n-drift.mjs
 *   pnpm check:i18n
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, '..', 'messages');
const SOURCE_LOCALE = 'en';

// Warn when a translation is this many times longer than English.
// Japanese/Chinese are typically shorter; Spanish/French can run ~30% longer.
// Flag anything > 2.5x as a potential UI overflow risk.
const LENGTH_WARN_RATIO = 2.5;

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadLocale(locale) {
	const path = join(MESSAGES_DIR, `${locale}.json`);
	return JSON.parse(readFileSync(path, 'utf8'));
}

function getLocales() {
	return readdirSync(MESSAGES_DIR)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.replace('.json', ''))
		.filter((l) => l !== SOURCE_LOCALE)
		.sort();
}

function stripHtml(str) {
	return String(str).replace(/<[^>]+>/g, '');
}

function checkLocale(sourceData, sourceKeys, locale) {
	const target = loadLocale(locale);
	const targetKeys = Object.keys(target).filter((k) => k !== '$schema');

	const missing = sourceKeys.filter((k) => !targetKeys.includes(k));
	const extra = targetKeys.filter((k) => !sourceKeys.includes(k));
	const lengthWarnings = [];

	for (const key of sourceKeys) {
		if (!targetKeys.includes(key)) continue;
		// Strip HTML tags before measuring — markup length shouldn't count
		const srcLen = stripHtml(sourceData[key]).length;
		const tgtLen = stripHtml(target[key]).length;
		if (srcLen === 0) continue;
		const ratio = tgtLen / srcLen;
		if (ratio > LENGTH_WARN_RATIO) {
			lengthWarnings.push({ key, srcLen, tgtLen, ratio: ratio.toFixed(2) });
		}
	}

	return { missing, extra, lengthWarnings, targetKeyCount: targetKeys.length };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const source = loadLocale(SOURCE_LOCALE);
const sourceKeys = Object.keys(source).filter((k) => k !== '$schema');
const locales = getLocales();

let hasErrors = false;
let totalMissing = 0;
let totalExtra = 0;
let totalLengthWarnings = 0;

const timestamp = new Date().toISOString();
console.log(`\n${'─'.repeat(60)}`);
console.log(` i18n Drift Report`);
console.log(` Source: ${SOURCE_LOCALE}.json  (${sourceKeys.length} keys)`);
console.log(` Locales: ${locales.join(', ')}`);
console.log(` Run at: ${timestamp}`);
console.log(`${'─'.repeat(60)}\n`);

for (const locale of locales) {
	let result;
	try {
		result = checkLocale(source, sourceKeys, locale);
	} catch (e) {
		console.log(`[FAIL] ${locale}.json — could not load: ${e.message}`);
		hasErrors = true;
		continue;
	}

	const { missing, extra, lengthWarnings, targetKeyCount } = result;
	totalMissing += missing.length;
	totalExtra += extra.length;
	totalLengthWarnings += lengthWarnings.length;

	const hasIssues = missing.length > 0 || extra.length > 0 || lengthWarnings.length > 0;
	const icon = missing.length > 0 ? '[FAIL]' : extra.length > 0 || lengthWarnings.length > 0 ? '[WARN]' : '[ OK ]';

	console.log(`${icon} ${locale}.json — ${targetKeyCount}/${sourceKeys.length} keys`);

	if (missing.length > 0) {
		hasErrors = true;
		console.log(`       Missing ${missing.length} key(s) — add to ${locale}.json:`);
		missing.forEach((k) => console.log(`         - ${k}`));
	}

	if (extra.length > 0) {
		console.log(`       Extra ${extra.length} key(s) not in ${SOURCE_LOCALE}.json (stale?):`);
		extra.forEach((k) => console.log(`         + ${k}`));
	}

	if (lengthWarnings.length > 0) {
		console.log(
			`       Length warnings (>${LENGTH_WARN_RATIO}x English — may overflow UI):`
		);
		lengthWarnings.forEach(({ key, srcLen, tgtLen, ratio }) => {
			console.log(`         ! ${key}: EN=${srcLen}ch → ${locale}=${tgtLen}ch (${ratio}x)`);
		});
	}

	if (!hasIssues) {
		// already printed OK above
	}
}

console.log(`\n${'─'.repeat(60)}`);
console.log(` Summary: ${locales.length} locales checked`);
console.log(`   Missing keys:    ${totalMissing}`);
console.log(`   Extra keys:      ${totalExtra}`);
console.log(`   Length warnings: ${totalLengthWarnings}`);
console.log(`${'─'.repeat(60)}\n`);

if (hasErrors) {
	console.log('RESULT: FAIL — fix missing keys before shipping\n');
	process.exit(1);
} else if (totalExtra > 0 || totalLengthWarnings > 0) {
	console.log('RESULT: WARN — locales in sync, review warnings above\n');
	process.exit(0);
} else {
	console.log('RESULT: PASS — all locales in sync\n');
	process.exit(0);
}
