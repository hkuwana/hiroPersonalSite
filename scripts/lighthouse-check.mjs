#!/usr/bin/env node
/**
 * Lighthouse Performance Loop
 *
 * Audits key pages using the Lighthouse Node API and Chrome.
 * By default tests against the PRODUCTION site (hirokuwana.com) so you can
 * run this overnight without spinning up a local server.
 *
 * Saves JSON reports to reports/lighthouse/ and tracks a baseline so you get
 * a clear delta every run — no LLM judge, just numbers.
 *
 * Flags:
 *   --update-baseline   Save current scores as the new baseline
 *   --url <url>         Override the base URL (e.g. http://localhost:4173)
 *
 * Exit 0  — all scores at or above thresholds and no baseline regressions
 * Exit 1  — threshold missed or regression vs baseline
 *
 * Requirements:
 *   pnpm add -D lighthouse
 *   Chrome/Chromium must be installed (uses chrome-launcher internally)
 *
 * Usage:
 *   node scripts/lighthouse-check.mjs
 *   node scripts/lighthouse-check.mjs --url http://localhost:4173
 *   node scripts/lighthouse-check.mjs --update-baseline
 *   pnpm check:lighthouse
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'reports', 'lighthouse');
const BASELINE_FILE = join(ROOT, 'reports', 'lighthouse-baseline.json');

const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const urlFlagIdx = process.argv.indexOf('--url');
const BASE_URL =
	urlFlagIdx !== -1 ? process.argv[urlFlagIdx + 1] : 'https://hirokuwana.com';

// ── Pages to audit ────────────────────────────────────────────────────────────
// Add routes here as the site grows.
const PAGES = [
	{ name: 'Homepage', path: '/' },
	{ name: 'Essays', path: '/essays' },
	{ name: 'ICS Validator', path: '/ics-validator' },
	{ name: 'VCF Splitter', path: '/vcf-splitter' },
];

// ── Score thresholds (0–100) ──────────────────────────────────────────────────
// A score below these values is an immediate FAIL regardless of baseline.
const THRESHOLDS = {
	performance: 80,
	accessibility: 90,
	'best-practices': 85,
	seo: 90,
};

// A drop of more than this many points vs baseline counts as a regression.
const REGRESSION_THRESHOLD = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

function score(lhrCategory) {
	return Math.round((lhrCategory?.score ?? 0) * 100);
}

function pad(str, n) {
	return String(str).padStart(n);
}

// ── Check for lighthouse dependency ───────────────────────────────────────────

let lighthouse, chromeLauncher;
try {
	({ default: lighthouse } = await import('lighthouse'));
	chromeLauncher = await import('chrome-launcher');
} catch {
	console.error('\n[FAIL] lighthouse is not installed.');
	console.error('       Run: pnpm add -D lighthouse');
	console.error('       Then re-run this script.\n');
	process.exit(1);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

mkdirSync(REPORTS_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const runKey = timestamp.slice(0, 19); // "2026-04-09T00-00-00"

console.log('\n── Lighthouse Check ─────────────────────────────────────────');
console.log(` Base URL: ${BASE_URL}`);
console.log(` Pages:    ${PAGES.map((p) => p.name).join(', ')}`);
console.log(` Mode:     ${UPDATE_BASELINE ? 'update-baseline' : 'check'}\n`);

// ── Launch Chrome once, reuse for all pages ───────────────────────────────────

let chrome;
try {
	chrome = await chromeLauncher.launch({
		chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
	});
} catch (e) {
	console.error('\n[FAIL] Could not launch Chrome.');
	console.error('       Make sure Chrome or Chromium is installed.');
	console.error(`       Error: ${e.message}\n`);
	process.exit(1);
}

// ── Run audits ────────────────────────────────────────────────────────────────

const results = {}; // pageName → scores

for (const page of PAGES) {
	const url = BASE_URL.replace(/\/$/, '') + page.path;
	process.stdout.write(`  Auditing ${page.name.padEnd(20)} ${url} … `);

	try {
		const runnerResult = await lighthouse(url, {
			logLevel: 'error',
			output: 'json',
			onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
			port: chrome.port,
			// Simulate a mid-range mobile device (Lighthouse default)
		});

		const lhr = JSON.parse(runnerResult.report);
		const cats = lhr.categories;

		const scores = {
			performance: score(cats.performance),
			accessibility: score(cats.accessibility),
			'best-practices': score(cats['best-practices']),
			seo: score(cats.seo),
		};

		results[page.name] = scores;

		// Save full JSON report
		const reportPath = join(REPORTS_DIR, `${page.name.toLowerCase().replace(/\s+/g, '-')}-${runKey}.json`);
		writeFileSync(reportPath, runnerResult.report);

		const perfLabel = scores.performance >= THRESHOLDS.performance ? '' : ' !!';
		process.stdout.write(
			`perf=${scores.performance}${perfLabel}  a11y=${scores.accessibility}  bp=${scores['best-practices']}  seo=${scores.seo}\n`
		);
	} catch (e) {
		process.stdout.write(`[ERROR] ${e.message}\n`);
		results[page.name] = null;
	}
}

await chrome.kill();

// ── Print score table ─────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(70)}`);
console.log(
	` ${'Page'.padEnd(22)} ${'Perf'.padStart(5)} ${'A11y'.padStart(5)} ${'BP'.padStart(5)} ${'SEO'.padStart(5)}`
);
console.log(`${'─'.repeat(70)}`);

let thresholdFail = false;

for (const page of PAGES) {
	const s = results[page.name];
	if (!s) {
		console.log(` ${page.name.padEnd(22)} ${'ERROR'.padStart(5)}`);
		continue;
	}

	const cols = ['performance', 'accessibility', 'best-practices', 'seo'].map((cat) => {
		const v = s[cat];
		const below = v < THRESHOLDS[cat];
		if (below) thresholdFail = true;
		return `${pad(v, 5)}${below ? '!' : ' '}`;
	});

	console.log(` ${page.name.padEnd(22)} ${cols.join('')}`);
}

console.log(`${'─'.repeat(70)}`);
console.log(
	` Thresholds:            ${pad(THRESHOLDS.performance, 5)}  ${pad(THRESHOLDS.accessibility, 5)}  ${pad(THRESHOLDS['best-practices'], 5)}  ${pad(THRESHOLDS.seo, 5)}`
);

// ── Regression check ──────────────────────────────────────────────────────────

let regressionFail = false;

if (existsSync(BASELINE_FILE) && !UPDATE_BASELINE) {
	const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));

	console.log(`\n${'─'.repeat(70)}`);
	console.log(` Regression vs baseline (${baseline.timestamp})`);
	console.log(`${'─'.repeat(70)}`);

	for (const page of PAGES) {
		const curr = results[page.name];
		const prev = baseline.scores?.[page.name];
		if (!curr || !prev) continue;

		const cats = ['performance', 'accessibility', 'best-practices', 'seo'];
		const deltas = cats.map((cat) => {
			const delta = curr[cat] - (prev[cat] ?? 0);
			const regressed = delta < -REGRESSION_THRESHOLD;
			if (regressed) regressionFail = true;
			const sign = delta > 0 ? '+' : '';
			const flag = regressed ? '!' : delta > 0 ? '+' : ' ';
			return `${flag}${sign}${pad(delta, 2)}`;
		});

		console.log(` ${page.name.padEnd(22)} ${deltas.map((d) => d.padStart(6)).join('')}`);
	}
}

// ── Save/update baseline ──────────────────────────────────────────────────────

if (UPDATE_BASELINE || !existsSync(BASELINE_FILE)) {
	const baselineData = {
		timestamp: new Date().toISOString(),
		baseUrl: BASE_URL,
		scores: results,
	};
	writeFileSync(BASELINE_FILE, JSON.stringify(baselineData, null, 2));
	console.log(`\n[INFO] Baseline saved → reports/lighthouse-baseline.json`);
}

// ── Summary ───────────────────────────────────────────────────────────────────

const failed = thresholdFail || regressionFail;
console.log(`\n${'─'.repeat(70)}`);

if (UPDATE_BASELINE) {
	console.log(' RESULT: BASELINE SAVED\n');
	process.exit(0);
} else if (failed) {
	if (thresholdFail) console.log(' RESULT: FAIL — one or more scores below threshold (marked with !)');
	if (regressionFail)
		console.log(` RESULT: FAIL — regression >${REGRESSION_THRESHOLD} pts vs baseline`);
	console.log(' Run with --update-baseline to accept current scores as new baseline.\n');
	process.exit(1);
} else {
	console.log(' RESULT: PASS — all scores above thresholds, no regressions\n');
	process.exit(0);
}
