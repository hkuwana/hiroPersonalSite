import type { RequestHandler } from './$types';
import { SITE } from '$data/constants';

export const prerender = true;

const FEED_TITLE = 'Hiro Kuwana — Essays';

interface EssayMetadata {
	title: string;
	date: string;
	description: string;
}

const escapeXml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

const toRfc822 = (date: string) => new Date(date).toUTCString();

export const GET: RequestHandler = async () => {
	const essayFiles = import.meta.glob(['/src/content/essays/*.md', '!/src/content/essays/_*.md'], {
		eager: true
	});

	const essays = Object.entries(essayFiles)
		.map(([path, module]) => {
			const slug = path.split('/').pop()?.replace('.md', '') || '';
			const { metadata } = module as { metadata: EssayMetadata };
			return {
				slug,
				title: metadata?.title ?? slug,
				date: metadata?.date,
				description: metadata?.description ?? ''
			};
		})
		.filter((essay) => essay.date)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const items = essays.map((essay) => {
		const link = `${SITE.url}/essays/${essay.slug}`;
		return `    <item>
      <title>${escapeXml(essay.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(essay.date)}</pubDate>
      <description>${escapeXml(essay.description)}</description>
    </item>`;
	});

	const lastBuild = essays[0] ? `\n    <lastBuildDate>${toRfc822(essays[0].date)}</lastBuildDate>` : '';

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(`${SITE.url}/essays`)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>${lastBuild}
    <atom:link href="${escapeXml(`${SITE.url}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
