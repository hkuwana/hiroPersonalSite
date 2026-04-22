import type { RequestHandler } from './$types';
import { getAllEssays, generateRss } from '$lib/essays/utils/essayIndex';
import { SITE } from '$data/constants';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const essays = getAllEssays();
	const body = generateRss(essays, SITE.url);

	return new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
