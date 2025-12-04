import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const site = 'https://hirokuwana.com';

	// Import all essays
	const essayFiles = import.meta.glob('/src/content/essays/*.md', { eager: true });

	const essays = Object.entries(essayFiles).map(([path, module]) => {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		const { metadata } = module as { metadata: { date: string } };
		return {
			url: `${site}/essays/${slug}`,
			lastmod: metadata?.date || new Date().toISOString().split('T')[0]
		};
	});

	const staticPages = [
		{ url: site, lastmod: new Date().toISOString().split('T')[0] },
		{ url: `${site}/essays`, lastmod: new Date().toISOString().split('T')[0] }
	];

	const allPages = [...staticPages, ...essays];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.url === site ? '1.0' : '0.8'}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
