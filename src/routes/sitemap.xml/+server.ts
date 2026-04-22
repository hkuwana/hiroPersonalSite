import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';
import { getAllEssays } from '$lib/essays/utils/essayIndex';

export const prerender = true;

interface SitemapEntry {
	loc: string;
	lastmod: string;
	changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority: number;
}

export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split('T')[0];
	const essays = getAllEssays();

	const entries: SitemapEntry[] = [
		{ loc: `${SITE.url}/`, lastmod: today, changefreq: 'monthly', priority: 1.0 },
		{ loc: `${SITE.url}/essays`, lastmod: today, changefreq: 'weekly', priority: 0.8 },
		{ loc: `${SITE.url}/ics-validator`, lastmod: today, changefreq: 'yearly', priority: 0.5 },
		{ loc: `${SITE.url}/vcf-splitter`, lastmod: today, changefreq: 'yearly', priority: 0.5 }
	];

	for (const essay of essays) {
		entries.push({
			loc: `${SITE.url}/essays/${essay.slug}`,
			lastmod: (essay.metadata.updated ?? essay.metadata.date).split('T')[0],
			changefreq: 'monthly',
			priority: 0.7
		});
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) => `	<url>
		<loc>${e.loc}</loc>
		<lastmod>${e.lastmod}</lastmod>
		<changefreq>${e.changefreq}</changefreq>
		<priority>${e.priority.toFixed(1)}</priority>
	</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
