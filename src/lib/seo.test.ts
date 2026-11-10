import { describe, expect, it } from 'vitest';
import { PROJECTS, SITE } from '$data/constants';
import {
	article,
	blog,
	blogPosting,
	breadcrumbs,
	homeGraph,
	jsonLd,
	KAIWA_ID,
	OTTERD_ID,
	person,
	PERSON_ID,
	toolsItemList,
	WEBSITE_ID,
	webApplication
} from './seo';

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
			'Organization',
			'Organization',
			'ProfilePage',
			'ItemList'
		]);
	});

	it('has no search action that the site cannot answer', () => {
		expect(jsonLd(homeGraph([]))).not.toContain('SearchAction');
	});

	it('lists every project on the home page, pointing at the companies by @id', () => {
		const graph = homeGraph(PROJECTS.map((p) => ({ name: p.name, description: p.description })));
		const list = graph.find((n) => n['@type'] === 'ItemList') as {
			itemListElement: { item: Record<string, unknown> }[];
		};
		const items = list.itemListElement.map((i) => i.item);
		expect(items).toHaveLength(PROJECTS.length);
		expect(items[PROJECTS.findIndex((p) => p.name === 'Kaiwa')]).toEqual({ '@id': KAIWA_ID });
		expect(items[PROJECTS.findIndex((p) => p.name === 'Otterd')]).toEqual({ '@id': OTTERD_ID });
		const others = items.filter((i) => !('@id' in i));
		expect(others.map((i) => i.name)).toEqual(
			PROJECTS.filter((p) => p.name !== 'Kaiwa' && p.name !== 'Otterd').map((p) => p.name)
		);
		expect(others[0].creator).toEqual({ '@id': PERSON_ID });
	});

	it('defines each company once, founded by the person, and links the person to them', () => {
		const graph = homeGraph([]);
		const orgs = graph.filter((n) => n['@type'] === 'Organization') as Record<string, unknown>[];
		expect(orgs.map((o) => o['@id'])).toEqual([KAIWA_ID, OTTERD_ID]);
		expect(orgs.every((o) => (o.founder as { '@id': string })['@id'] === PERSON_ID)).toBe(true);
		expect(person.worksFor).toEqual([{ '@id': KAIWA_ID }, { '@id': OTTERD_ID }]);
		expect(person.alternateName).toEqual(
			expect.arrayContaining(['Hiroyuki (Hiro) Kuwana', '桑名浩行', '桑名 浩行'])
		);
		expect(person).not.toHaveProperty('description');
	});

	it('gives each essay an absolute URL, an author and an image', () => {
		const post = blogPosting(essay);
		expect(post.url).toBe(`${SITE.url}/essays/quotes`);
		expect(post.author).toEqual({ '@id': PERSON_ID });
		expect(post.image).toBe(SITE.image);
		expect(blog([essay]).blogPost).toHaveLength(1);
	});

	it('uses the updated date as dateModified when an essay is revised', () => {
		expect(blogPosting(essay).dateModified).toBe(essay.date);
		expect(blogPosting(essay)).not.toHaveProperty('wordCount');
		const revised = blogPosting({ ...essay, updated: '2026-06-01', wordCount: 1200 });
		expect(revised.datePublished).toBe(essay.date);
		expect(revised.dateModified).toBe('2026-06-01');
		expect(revised.wordCount).toBe(1200);
	});

	it('describes a guide as an article with linkable sections', () => {
		const node = article({
			headline: 'AI Guides',
			description: 'd',
			path: '/ai-guides',
			updated: '2026-05-12',
			sections: [{ id: 'prompt-versioning', name: 'Versioning' }]
		});
		expect(node['@type']).toBe('Article');
		expect(node.dateModified).toBe('2026-05-12');
		expect(node.author).toEqual({ '@id': PERSON_ID });
		expect(node.hasPart).toEqual([
			expect.objectContaining({ url: `${SITE.url}/ai-guides#prompt-versioning`, name: 'Versioning' })
		]);
	});

	it('describes a tool as a free web application on the site', () => {
		const app = webApplication({ name: 'Tool', description: 'd', path: '/tools/x' });
		expect(app['@type']).toBe('WebApplication');
		expect(app.url).toBe(`${SITE.url}/tools/x`);
		expect(app.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'USD' });
		expect(app.isPartOf).toEqual({ '@id': WEBSITE_ID });
		const list = toolsItemList([{ name: 'Tool', path: '/tools/x' }]).itemListElement as {
			position: number;
			url: string;
		}[];
		expect(list).toEqual([expect.objectContaining({ position: 1, url: `${SITE.url}/tools/x` })]);
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
