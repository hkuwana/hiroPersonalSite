#!/usr/bin/env node
/**
 * Schema.org Structured Data Validator
 *
 * Fetches each page, extracts all JSON-LD blocks, and validates them against
 * Google's Rich Results requirements (Person, WebSite, Article, FAQPage).
 *
 * Also checks Japanese-locale pages for proper `inLanguage` tagging —
 * critical for ranking on Japanese Google (ja.hirokuwana.com or ?lang=ja).
 *
 * Why this helps Google ranking:
 *  - Article schema → eligible for Article rich results (date, author in SERP)
 *  - FAQPage schema → FAQ rich results (expands your SERP real estate 2-3x)
 *  - Person schema  → Knowledge Graph card eligibility
 *  - inLanguage     → Google uses this to serve localized rich results
 *
 * No LLM judge — all rules are drawn from Google's official documentation:
 * https://developers.google.com/search/docs/appearance/structured-data
 *
 * Flags:
 *   --url <base>   Override base URL (default: https://hirokuwana.com)
 *   --verbose      Show full JSON-LD blocks
 *
 * Exit 0  — all schemas valid
 * Exit 1  — required fields missing or JSON parse errors
 *
 * Usage:
 *   node scripts/schema-check.mjs
 *   node scripts/schema-check.mjs --url http://localhost:4173
 *   pnpm check:schema
 */

const urlFlagIdx = process.argv.indexOf('--url');
const BASE_URL =
	urlFlagIdx !== -1 ? process.argv[urlFlagIdx + 1] : 'https://hirokuwana.com';
const VERBOSE = process.argv.includes('--verbose');

// ── Pages to check ────────────────────────────────────────────────────────────
// Add locale variants here when Japanese pages go live.
const PAGES = [
	{ name: 'Homepage (en)', url: `${BASE_URL}/`, locale: 'en' },
	{ name: 'Essays list (en)', url: `${BASE_URL}/essays`, locale: 'en' },
	{ name: 'ICS Validator (en)', url: `${BASE_URL}/ics-validator`, locale: 'en' },
	// When Japanese routes exist, uncomment and add:
	// { name: 'Homepage (ja)', url: `${BASE_URL}/ja`, locale: 'ja' },
	// { name: 'Essay (ja)', url: `${BASE_URL}/ja/essays/your-funnel-is-a-lie`, locale: 'ja' },
];

// ── Google Rich Results field requirements ────────────────────────────────────
// Source: https://developers.google.com/search/docs/appearance/structured-data/
//
// Each entry is { field, required, note }
// required=true → fail if missing
// required=false → warn if missing (recommended for enhanced display)

const SCHEMA_RULES = {
	Person: {
		required: ['name'],
		recommended: ['url', 'image', 'sameAs', 'jobTitle', 'worksFor', 'description'],
		richResultEligible: false, // used for Knowledge Graph, not a Rich Result type
		note: 'Person schema contributes to Knowledge Graph. sameAs is critical.',
	},
	WebSite: {
		required: ['name', 'url'],
		recommended: ['description', 'author', 'potentialAction'],
		richResultEligible: true,
		note: 'Add potentialAction.SearchAction to enable Sitelinks Searchbox.',
	},
	Article: {
		required: ['headline', 'datePublished', 'author'],
		recommended: ['image', 'dateModified', 'description', 'publisher', 'inLanguage', 'wordCount', 'mainEntityOfPage'],
		richResultEligible: true,
		note: 'image is REQUIRED for Google Article rich results with visual display.',
	},
	BlogPosting: {
		required: ['headline', 'datePublished', 'author'],
		recommended: ['image', 'dateModified', 'description', 'publisher', 'inLanguage'],
		richResultEligible: true,
		note: 'Same rules as Article. Use BlogPosting for personal essays.',
	},
	FAQPage: {
		required: ['mainEntity'],
		recommended: [],
		richResultEligible: true,
		note: 'FAQ rich results can triple your SERP space. mainEntity items must have Question + Answer.',
	},
	BreadcrumbList: {
		required: ['itemListElement'],
		recommended: [],
		richResultEligible: true,
		note: 'Breadcrumbs appear in URL line of Google results.',
	},
};

// Fields required on each FAQ Question entity
const FAQ_QUESTION_RULES = {
	required: ['@type', 'name', 'acceptedAnswer'],
	answerRequired: ['@type', 'text'],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJsonLd(html) {
	const blocks = [];
	const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
	let match;
	while ((match = regex.exec(html)) !== null) {
		try {
			blocks.push(JSON.parse(match[1]));
		} catch (e) {
			blocks.push({ __parseError: e.message, __raw: match[1].slice(0, 200) });
		}
	}
	return blocks;
}

function checkSchema(block, locale) {
	const issues = { errors: [], warnings: [], info: [] };
	const type = block['@type'];

	if (!type) {
		issues.errors.push('Missing @type');
		return issues;
	}

	const rules = SCHEMA_RULES[type];
	if (!rules) {
		issues.info.push(`Unknown type "${type}" — no rules to check`);
		return issues;
	}

	// Required fields
	for (const field of rules.required) {
		if (!block[field]) {
			issues.errors.push(`Missing required field: "${field}" (${type})`);
		}
	}

	// Recommended fields
	for (const field of rules.recommended) {
		if (!block[field]) {
			issues.warnings.push(`Missing recommended field: "${field}" — needed for best Rich Results display`);
		}
	}

	// Type-specific deep checks
	if (type === 'FAQPage') {
		const entities = block.mainEntity;
		if (!Array.isArray(entities) || entities.length === 0) {
			issues.errors.push('FAQPage.mainEntity must be a non-empty array');
		} else {
			entities.forEach((q, i) => {
				for (const f of FAQ_QUESTION_RULES.required) {
					if (!q[f]) issues.errors.push(`FAQ item[${i}] missing "${f}"`);
				}
				if (q.acceptedAnswer) {
					for (const f of FAQ_QUESTION_RULES.answerRequired) {
						if (!q.acceptedAnswer[f]) {
							issues.errors.push(`FAQ item[${i}].acceptedAnswer missing "${f}"`);
						}
					}
				}
			});
			if (entities.length > 0 && !issues.errors.length) {
				issues.info.push(`FAQPage has ${entities.length} Q&A pairs — eligible for FAQ Rich Results`);
			}
		}
	}

	if (type === 'Article' || type === 'BlogPosting') {
		// Google requires image for visual Article rich results
		if (!block.image) {
			issues.errors.push(
				'Article.image is MISSING — Google will NOT show Article rich results without an image'
			);
		}
		// Check author has a name
		if (block.author && !block.author.name) {
			issues.errors.push('Article.author must have a "name" field');
		}
		// Check headline length (Google truncates at ~110 chars)
		if (block.headline && block.headline.length > 110) {
			issues.warnings.push(
				`Article.headline is ${block.headline.length} chars — Google may truncate at 110`
			);
		}
		// inLanguage for non-English content
		if (locale !== 'en' && !block.inLanguage) {
			issues.errors.push(
				`Article.inLanguage is missing on a ${locale} page — required for Japanese/multilingual rich results`
			);
		}
	}

	if (type === 'Person') {
		// sameAs is what Google uses to build the Knowledge Graph card
		if (!block.sameAs || block.sameAs.length === 0) {
			issues.warnings.push(
				'Person.sameAs is empty — add LinkedIn, GitHub, Twitter URLs to improve Knowledge Graph eligibility'
			);
		}
		// Twitter handle in sameAs
		const sameAs = block.sameAs ?? [];
		if (!sameAs.some((url) => url.includes('twitter.com') || url.includes('x.com'))) {
			issues.warnings.push('Person.sameAs: consider adding Twitter/X profile URL');
		}
	}

	if (type === 'WebSite') {
		// SearchAction enables Sitelinks Searchbox
		if (!block.potentialAction) {
			issues.warnings.push(
				'WebSite.potentialAction missing — add a SearchAction to enable Google Sitelinks Searchbox'
			);
		}
	}

	// JSON-LD best-practice: @context should be https
	if (block['@context'] && !block['@context'].startsWith('https://')) {
		issues.warnings.push('@context should use https:// (not http://)');
	}

	if (rules.richResultEligible && issues.errors.length === 0) {
		issues.info.push(`✓ Eligible for ${type} Rich Results`);
	}

	return issues;
}

// ── SearchAction suggestion ────────────────────────────────────────────────────
// Auto-generates the missing potentialAction block so you can copy-paste it in.

function suggestSearchAction(siteUrl) {
	return JSON.stringify(
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Hiro Kuwana',
			url: siteUrl,
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: `${siteUrl}/essays?q={search_term_string}`,
				},
				'query-input': 'required name=search_term_string',
			},
		},
		null,
		2
	);
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('\n── Schema.org Validator ─────────────────────────────────────');
console.log(` Base URL: ${BASE_URL}`);
console.log(` Pages:    ${PAGES.length}`);
console.log(` Checking: Google Rich Results eligibility + Japanese locale tags\n`);

let totalErrors = 0;
let totalWarnings = 0;
let richResultsEligible = [];

for (const page of PAGES) {
	console.log(`${'─'.repeat(60)}`);
	console.log(` ${page.name}`);
	console.log(` ${page.url}`);

	let html;
	try {
		const res = await fetch(page.url, {
			headers: { 'Accept-Language': page.locale === 'ja' ? 'ja,en;q=0.5' : 'en-US,en;q=0.9' },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		html = await res.text();
	} catch (e) {
		console.log(` [FAIL] Could not fetch page: ${e.message}\n`);
		totalErrors++;
		continue;
	}

	const blocks = extractJsonLd(html);

	if (blocks.length === 0) {
		console.log(' [WARN] No JSON-LD blocks found on this page');
		totalWarnings++;
		continue;
	}

	console.log(` Found ${blocks.length} JSON-LD block(s)\n`);

	for (const block of blocks) {
		if (block.__parseError) {
			console.log(` [FAIL] JSON parse error: ${block.__parseError}`);
			console.log(`        Raw: ${block.__raw}…`);
			totalErrors++;
			continue;
		}

		const type = block['@type'] ?? 'Unknown';
		console.log(` Schema: ${type}`);

		if (VERBOSE) {
			console.log(' Full JSON-LD:');
			console.log(JSON.stringify(block, null, 2).split('\n').map((l) => '   ' + l).join('\n'));
		}

		const { errors, warnings, info } = checkSchema(block, page.locale);

		errors.forEach((e) => {
			console.log(`   [ERROR] ${e}`);
			totalErrors++;
		});
		warnings.forEach((w) => {
			console.log(`   [WARN]  ${w}`);
			totalWarnings++;
		});
		info.forEach((i) => {
			console.log(`   [INFO]  ${i}`);
			if (i.startsWith('✓')) richResultsEligible.push(`${type} on ${page.name}`);
		});

		console.log('');
	}
}

// ── Suggestions ───────────────────────────────────────────────────────────────

const hasMissingSearchAction = totalWarnings > 0; // rough proxy
if (hasMissingSearchAction) {
	console.log(`${'─'.repeat(60)}`);
	console.log(' Suggested WebSite schema with SearchAction (copy into +page.svelte):');
	console.log('');
	suggestSearchAction(BASE_URL)
		.split('\n')
		.forEach((l) => console.log('   ' + l));
	console.log('');
}

// ── Japanese schema prep note ─────────────────────────────────────────────────

console.log(`${'─'.repeat(60)}`);
console.log(' Japanese SEO readiness:');
console.log(' When Japanese routes go live, add these fields to Article schema:');
console.log('   "inLanguage": "ja",');
console.log('   "author": { "@type": "Person", "name": "桑名浩行", "url": "https://hirokuwana.com" }');
console.log(' And uncomment the Japanese page entries in PAGES at the top of this script.');
console.log('');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`${'─'.repeat(60)}`);
console.log(' Rich Results eligible schemas:');
richResultsEligible.forEach((r) => console.log(`   ✓ ${r}`));
console.log('');
console.log(` Total errors:   ${totalErrors}`);
console.log(` Total warnings: ${totalWarnings}`);
console.log(`${'─'.repeat(60)}\n`);

if (totalErrors > 0) {
	console.log(' RESULT: FAIL — fix errors to maintain Rich Results eligibility\n');
	process.exit(1);
} else if (totalWarnings > 0) {
	console.log(' RESULT: WARN — no errors, but review recommendations above\n');
	process.exit(0);
} else {
	console.log(' RESULT: PASS — all schemas valid and Rich Results eligible\n');
	process.exit(0);
}
