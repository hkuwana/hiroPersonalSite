import { describe, expect, it } from 'vitest';
import { PROJECTS, SITE } from '$data/constants';
import { blog, blogPosting, breadcrumbs, homeGraph, jsonLd, PERSON_ID } from './seo';

const essay = {
	slug: 'quotes',
	title: 'A "quoted" title </script><b>',
	date: '2026-05-12',
	description: 'Uses "quotes" and a backslash \\ safely.'
};
const parse = (tag: string) =>
	JSON.parse(tag.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, ''));

describe('structured data', () => {
	it('stays valid JSON and cannot close its own script tag', () => {
		const tag = jsonLd(blogPosting(essay));
		expect(tag.match(/<\/script>/g)).toHaveLength(1);
		expect(parse(tag).headline).toBe(essay.title);
		expect(parse(tag).description).toBe(essay.description);
	});

	it('wraps several nodes in one graph with a context', () => {
		const data = parse(jsonLd(homeGraph([])));
		expect(data['@context']).toBe('https://schema.org');
		expect(data['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual([
			'Person',
			'WebSite',
			'ProfilePage',
			'ItemList'
		]);
	});

	it('has no search action that the site cannot answer', () => {
		expect(jsonLd(homeGraph([]))).not.toContain('SearchAction');
	});

	it('lists every project on the home page, credited to the person', () => {
		const list = homeGraph(PROJECTS.map((p) => ({ name: p.name, description: p.description })))[3];
		const items = list.itemListElement as { item: { name: string; creator: unknown } }[];
		expect(items.map((i) => i.item.name)).toEqual(PROJECTS.map((p) => p.name));
		expect(items[0].item.creator).toEqual({ '@id': PERSON_ID });
	});

	it('gives each essay an absolute URL, an author and an image', () => {
		const post = blogPosting(essay);
		expect(post.url).toBe(`${SITE.url}/essays/quotes`);
		expect(post.author).toEqual({ '@id': PERSON_ID });
		expect(post.image).toBe(SITE.image);
		expect(blog([essay]).blogPost).toHaveLength(1);
	});

	it('numbers breadcrumbs from one, with absolute URLs', () => {
		const trail = breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Essays', path: '/essays' }
		]).itemListElement as { position: number; item: string }[];
		expect(trail.map((t) => t.position)).toEqual([1, 2]);
		expect(trail[1].item).toBe(`${SITE.url}/essays`);
	});
});
