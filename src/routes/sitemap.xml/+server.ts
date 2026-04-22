import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';
import { getAllEssays } from '$lib/essays/utils/essayIndex';

export const prerender = true;

const LOCALES = ['en', 'ja', 'es', 'zh'] as const;

type ChangeFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface SitemapRow {
	path: string;
	lastmod: string;
	changefreq: ChangeFreq;
	priority: number;
	// If true, emit hreflang alternates. Essays and tools are English-primary
	// for now; only homepage and evergreen pages are fully localized.
	localized: boolean;
}

function localeHref(locale: string, path: string): string {
	if (locale === 'en') return `${SITE.url}${path}`;
	// Strip trailing slash from root to avoid /ja//
	const clean = path === '/' ? '' : path;
	return `${SITE.url}/${locale}${clean}`;
}

function urlEntry(row: SitemapRow): string {
	const alternates = row.localized
		? LOCALES.map(
				(loc) =>
					`\t\t<xhtml:link rel="alternate" hreflang="${loc === 'en' ? 'en-US' : loc === 'ja' ? 'ja-JP' : loc === 'es' ? 'es' : 'zh-CN'}" href="${localeHref(loc, row.path)}" />`
			).join('\n') +
			`\n\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${localeHref('en', row.path)}" />`
		: '';

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

	const rows: SitemapRow[] = [
		{ path: '/', lastmod: today, changefreq: 'monthly', priority: 1.0, localized: true },
		{ path: '/essays', lastmod: today, changefreq: 'weekly', priority: 0.8, localized: true },
		{ path: '/now', lastmod: today, changefreq: 'monthly', priority: 0.6, localized: true },
		{ path: '/privacy', lastmod: today, changefreq: 'yearly', priority: 0.3, localized: true },
		{ path: '/ics-validator', lastmod: today, changefreq: 'yearly', priority: 0.5, localized: false },
		{ path: '/vcf-splitter', lastmod: today, changefreq: 'yearly', priority: 0.5, localized: false }
	];

	for (const essay of essays) {
		rows.push({
			path: `/essays/${essay.slug}`,
			lastmod: (essay.metadata.updated ?? essay.metadata.date).split('T')[0],
			changefreq: 'monthly',
			priority: 0.7,
			localized: false
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
