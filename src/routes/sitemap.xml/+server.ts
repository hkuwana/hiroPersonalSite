import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';
import { getAllEssays } from '$lib/essays/utils/essayIndex';
import {
	getAllPlaybooks,
	getAvailableLocales,
	type PlaybookLocale
} from '$lib/playbooks/utils/playbookIndex';

export const prerender = true;

const LOCALES = ['en', 'ja', 'es', 'zh'] as const;
type Locale = (typeof LOCALES)[number];

type ChangeFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface SitemapRow {
	path: string;
	lastmod: string;
	changefreq: ChangeFreq;
	priority: number;
	// If 'all', emit hreflang for every site locale (for fully-localized
	// pages like the homepage). If a list, emit only those specific locales
	// (for content pages with partial translations like playbooks). If
	// 'none', emit no alternates.
	hreflang: 'all' | 'none' | Locale[];
}

function hreflangTagFor(locale: Locale): string {
	switch (locale) {
		case 'en':
			return 'en-US';
		case 'ja':
			return 'ja-JP';
		case 'es':
			return 'es';
		case 'zh':
			return 'zh-CN';
	}
}

function localeHref(locale: Locale, path: string): string {
	if (locale === 'en') return `${SITE.url}${path}`;
	// Strip trailing slash from root to avoid /ja//
	const clean = path === '/' ? '' : path;
	return `${SITE.url}/${locale}${clean}`;
}

function urlEntry(row: SitemapRow): string {
	let alternates = '';
	if (row.hreflang !== 'none') {
		const locales: readonly Locale[] = row.hreflang === 'all' ? LOCALES : row.hreflang;
		alternates =
			locales
				.map(
					(loc) =>
						`\t\t<xhtml:link rel="alternate" hreflang="${hreflangTagFor(loc)}" href="${localeHref(loc, row.path)}" />`
				)
				.join('\n') +
			`\n\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${localeHref('en', row.path)}" />`;
	}

	return `\t<url>
\t\t<loc>${SITE.url}${row.path}</loc>
\t\t<lastmod>${row.lastmod}</lastmod>
\t\t<changefreq>${row.changefreq}</changefreq>
\t\t<priority>${row.priority.toFixed(1)}</priority>${alternates ? '\n' + alternates : ''}
\t</url>`;
}

export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split('T')[0];
	const essays = getAllEssays();
	const playbooks = getAllPlaybooks();

	const rows: SitemapRow[] = [
		{ path: '/', lastmod: today, changefreq: 'monthly', priority: 1.0, hreflang: 'all' },
		{ path: '/essays', lastmod: today, changefreq: 'weekly', priority: 0.8, hreflang: 'all' },
		{ path: '/playbooks', lastmod: today, changefreq: 'weekly', priority: 0.8, hreflang: 'all' },
		{ path: '/now', lastmod: today, changefreq: 'monthly', priority: 0.6, hreflang: 'all' },
		{ path: '/privacy', lastmod: today, changefreq: 'yearly', priority: 0.3, hreflang: 'all' },
		{ path: '/ics-validator', lastmod: today, changefreq: 'yearly', priority: 0.5, hreflang: 'none' },
		{ path: '/vcf-splitter', lastmod: today, changefreq: 'yearly', priority: 0.5, hreflang: 'none' }
	];

	for (const essay of essays) {
		rows.push({
			path: `/essays/${essay.slug}`,
			lastmod: (essay.metadata.updated ?? essay.metadata.date).split('T')[0],
			changefreq: 'monthly',
			priority: 0.7,
			hreflang: 'none'
		});
	}

	for (const playbook of playbooks) {
		const available = getAvailableLocales(playbook.slug) as PlaybookLocale[];
		// Only emit hreflang when 2+ translations exist; otherwise it's noise.
		const hreflang: SitemapRow['hreflang'] =
			available.length > 1 ? (available as Locale[]) : 'none';

		rows.push({
			path: `/playbooks/${playbook.slug}`,
			lastmod: (playbook.metadata.updated ?? playbook.metadata.date).split('T')[0],
			changefreq: 'monthly',
			priority: 0.7,
			hreflang
		});
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows.map(urlEntry).join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
