#!/usr/bin/env node
/**
 * Bundle Size Regression Checker
 *
 * Runs `pnpm build`, analyzes the client output, and compares against budgets
 * and a stored baseline. Fails if any budget is exceeded or if any metric has
 * regressed by more than REGRESSION_THRESHOLD_KB since the last baseline.
 *
 * Flags:
 *   --update-baseline   Save current numbers as the new baseline (no pass/fail)
 *   --skip-build        Skip the build step (use existing .svelte-kit output)
 *
 * Exit 0  — within budget and no regressions
 * Exit 1  — budget exceeded or regression detected
 *
 * Usage:
 *   node scripts/bundle-check.mjs
 *   node scripts/bundle-check.mjs --update-baseline
 *   pnpm check:bundle
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// SvelteKit client output (always built regardless of adapter)
const CLIENT_DIR = join(ROOT, '.svelte-kit', 'output', 'client');
const BASELINE_FILE = join(ROOT, '.bundle-baseline.json');

const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const SKIP_BUILD = process.argv.includes('--skip-build');

// ── Budget thresholds (in KB) ─────────────────────────────────────────────────
// Adjust these as the site grows. Start strict, loosen only intentionally.
const BUDGETS_KB = {
	totalJS: 400, // all JS served to the client
	totalCSS: 80, // all CSS
	largestJSChunk: 200, // single biggest JS file
};

// A change of this many KB in one run counts as a regression worth flagging
const REGRESSION_THRESHOLD_KB = 5;

// ── Helpers ──────────────────────────────────────────────────────────────────

function kb(bytes) {
	return (bytes / 1024).toFixed(1);
}

function getAllFiles(dir, files = []) {
	if (!existsSync(dir)) return files;
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			getAllFiles(full, files);
		} else {
			files.push(full);
		}
	}
	return files;
}

function analyzeDir() {
	const allFiles = getAllFiles(CLIENT_DIR);
	const jsFiles = allFiles.filter((f) => extname(f) === '.js');
	const cssFiles = allFiles.filter((f) => extname(f) === '.css');

	const jsSizes = jsFiles.map((f) => ({ path: relative(ROOT, f), bytes: statSync(f).size }));
	const cssSizes = cssFiles.map((f) => ({ path: relative(ROOT, f), bytes: statSync(f).size }));

	const totalJS = jsSizes.reduce((s, f) => s + f.bytes, 0);
	const totalCSS = cssSizes.reduce((s, f) => s + f.bytes, 0);
	const largestJSChunk = Math.max(...jsSizes.map((f) => f.bytes), 0);

	// Sort largest-first for the top-N display
	jsSizes.sort((a, b) => b.bytes - a.bytes);

	return { totalJS, totalCSS, largestJSChunk, jsSizes, cssSizes };
}

// ── Build ─────────────────────────────────────────────────────────────────────

if (!SKIP_BUILD) {
	console.log('\n── Bundle Check ─────────────────────────────────────────────');
	console.log('Running pnpm build …\n');
	try {
		execSync('pnpm build', { cwd: ROOT, stdio: 'inherit' });
	} catch {
		console.error('\n[FAIL] Build failed — cannot check bundle sizes');
		process.exit(1);
	}
} else {
	console.log('\n── Bundle Check (skipping build) ────────────────────────────');
}

// ── Analyze ───────────────────────────────────────────────────────────────────

if (!existsSync(CLIENT_DIR)) {
	console.error(`[FAIL] Client output not found at: ${CLIENT_DIR}`);
	console.error('       Run without --skip-build, or run pnpm build first.');
	process.exit(1);
}

const { totalJS, totalCSS, largestJSChunk, jsSizes } = analyzeDir();
const timestamp = new Date().toISOString();

const current = { totalJS, totalCSS, largestJSChunk, timestamp };

// ── Report ────────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(60)}`);
console.log(' Bundle Analysis');
console.log(`${'─'.repeat(60)}`);
console.log(
	` Total JS:        ${kb(totalJS).padStart(7)} KB   budget: ${BUDGETS_KB.totalJS} KB`
);
console.log(
	` Total CSS:       ${kb(totalCSS).padStart(7)} KB   budget: ${BUDGETS_KB.totalCSS} KB`
);
console.log(
	` Largest JS chunk:${kb(largestJSChunk).padStart(7)} KB   budget: ${BUDGETS_KB.largestJSChunk} KB`
);

console.log('\n Top JS chunks by size:');
jsSizes.slice(0, 8).forEach((f) => {
	const bar = '█'.repeat(Math.round(f.bytes / 5000));
	console.log(`   ${kb(f.bytes).padStart(6)} KB  ${bar}  ${f.path}`);
});

// ── Budget check ──────────────────────────────────────────────────────────────

let budgetFail = false;
const budgetResults = [];

for (const [key, limitKB] of Object.entries(BUDGETS_KB)) {
	const actual = current[key];
	const limitBytes = limitKB * 1024;
	const over = actual > limitBytes;
	if (over) budgetFail = true;
	budgetResults.push({ key, actual, limitKB, over });
}

if (budgetFail) {
	console.log('\n Budget violations:');
	budgetResults
		.filter((r) => r.over)
		.forEach((r) => {
			console.log(
				`   [FAIL] ${r.key}: ${kb(r.actual)} KB exceeds ${r.limitKB} KB budget`
			);
		});
}

// ── Regression check ─────────────────────────────────────────────────────────

let regressionFail = false;

if (existsSync(BASELINE_FILE) && !UPDATE_BASELINE) {
	const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));

	console.log(`\n${'─'.repeat(60)}`);
	console.log(` Regression Check  (baseline: ${baseline.timestamp})`);
	console.log(`${'─'.repeat(60)}`);

	const metrics = ['totalJS', 'totalCSS', 'largestJSChunk'];
	for (const key of metrics) {
		const prev = baseline[key] ?? 0;
		const curr = current[key];
		const deltaBytes = curr - prev;
		const deltaKB = deltaBytes / 1024;
		const regressed = deltaBytes > REGRESSION_THRESHOLD_KB * 1024;
		const improved = deltaBytes < -1024; // >1 KB smaller is a win

		const sign = deltaKB > 0 ? '+' : '';
		const status = regressed ? '[FAIL]' : improved ? '[ WIN]' : '[ OK ]';
		if (regressed) regressionFail = true;

		console.log(
			` ${status} ${key.padEnd(18)} ${kb(curr).padStart(7)} KB  (${sign}${deltaKB.toFixed(1)} KB)`
		);
	}
}

// ── Update baseline ───────────────────────────────────────────────────────────

if (UPDATE_BASELINE || !existsSync(BASELINE_FILE)) {
	writeFileSync(BASELINE_FILE, JSON.stringify(current, null, 2));
	const action = existsSync(BASELINE_FILE) ? 'Updated' : 'Created';
	console.log(`\n[INFO] ${action} baseline → .bundle-baseline.json`);
}

// ── Summary ───────────────────────────────────────────────────────────────────

const failed = budgetFail || regressionFail;
console.log(`\n${'─'.repeat(60)}`);
if (UPDATE_BASELINE) {
	console.log(' RESULT: BASELINE SAVED\n');
	process.exit(0);
} else if (failed) {
	if (budgetFail) console.log(' RESULT: FAIL — budget exceeded');
	if (regressionFail) console.log(' RESULT: FAIL — regression detected');
	console.log(' Run with --update-baseline to accept current sizes as new baseline.\n');
	process.exit(1);
} else {
	console.log(' RESULT: PASS — within budget, no regressions\n');
	process.exit(0);
}
