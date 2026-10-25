import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';

export const prerender = true;

interface EssayMetadata {
	title: string;
	date: string;
	description: string;
}

const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] = [
	{ path: '/', changefreq: 'monthly', priority: '1.0' },
	{ path: '/essays', changefreq: 'weekly', priority: '0.9' },
	{ path: '/about', changefreq: 'monthly', priority: '0.85' },
	{ path: '/ai-guides', changefreq: 'weekly', priority: '0.8' },
	{ path: '/tools', changefreq: 'monthly', priority: '0.7' },
	{ path: '/tools/ics-formatter', changefreq: 'monthly', priority: '0.6' },
	{ path: '/tools/vcf-splitter', changefreq: 'monthly', priority: '0.6' },
	{ path: '/case-study', changefreq: 'monthly', priority: '0.6' }
];

const buildAlternates = (path: string) => {
	const suffix = path === '/' ? '' : path;
	return `        <xhtml:link rel="alternate" hreflang="en" href="${SITE.url}${suffix}" />
        <xhtml:link rel="alternate" hreflang="ja" href="${SITE.url}/ja${suffix}" />
        <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.url}${suffix}" />`;
};

export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split('T')[0];

	const essayFiles = import.meta.glob(['/src/content/essays/*.md', '!/src/content/essays/_*.md'], {
		eager: true
	});
	const essays = Object.entries(essayFiles).map(([path, module]) => {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		const { metadata } = module as { metadata: EssayMetadata };
		return { slug, date: metadata?.date };
	});

	const urls: string[] = [];
	// Only real change dates: the home page and the essay list change when an
	// essay is published. A date that moves on every build teaches crawlers
	// to ignore lastmod, so the other pages leave it out.
	const newest = essays
		.map((e) => e.date)
		.filter(Boolean)
		.sort()
		.at(-1);
	const lastmodFor = (path: string) =>
		newest && (path === '/' || path === '/essays')
			? `\n        <lastmod>${new Date(newest).toISOString().split('T')[0]}</lastmod>`
			: '';

	for (const route of STATIC_ROUTES) {
		const suffix = route.path === '/' ? '' : route.path;
		urls.push(`    <url>
        <loc>${SITE.url}${suffix}</loc>${lastmodFor(route.path)}
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
${buildAlternates(route.path)}
    </url>`);
	}

	for (const essay of essays) {
		const lastmod = essay.date ? new Date(essay.date).toISOString().split('T')[0] : today;
		const path = `/essays/${essay.slug}`;
		urls.push(`    <url>
        <loc>${SITE.url}${path}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.7</priority>
${buildAlternates(path)}
    </url>`);
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
