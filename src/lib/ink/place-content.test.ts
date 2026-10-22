import { describe, expect, it } from 'vitest';
import { FACETS } from '$lib/home/facets';
import { facetContent, facetOf, sailName } from './place-content';

const essays = [
	{ slug: 'b', title: 'Second', date: '2026-03-01' },
	{ slug: 'a', title: 'First', date: '2026-04-01' },
	{ slug: 'c', title: 'Third', date: '2026-02-01' },
	{ slug: 'd', title: 'Fourth', date: '2026-01-01' }
];

describe('facetContent', () => {
	it('uses the site facet copy word for word', () => {
		for (const facet of FACETS) {
			for (const lang of ['en', 'ja'] as const) {
				const c = facetContent(facet.id, lang, essays);
				expect(c.kanji).toBe(facet.kanji);
				expect(c.line).toBe(facet.line[lang]);
				expect(c.title).toBe(facet.title[lang]);
			}
		}
	});

	it('sends home-page anchors to the home page', () => {
		expect(facetContent('builder', 'en').link?.href).toBe('/#work');
		expect(facetContent('writer', 'en').link?.href).toBe('/#writing');
	});

	it('lists at most three essays for the writer, linked to their pages', () => {
		const items = facetContent('writer', 'en', essays).items;
		expect(items).toHaveLength(3);
		expect(items[0]).toMatchObject({ label: 'Second', href: '/essays/b' });
	});

	it('lists the projects that are not sunset for the builder', () => {
		const items = facetContent('builder', 'en').items;
		expect(items.length).toBeGreaterThan(0);
		expect(items.map((i) => i.label)).not.toContain('Flybyrd');
	});

	it('has no profile or about links', () => {
		for (const facet of FACETS) {
			const c = facetContent(facet.id, 'en', essays);
			const hrefs = [c.link?.href, ...c.items.map((i) => i.href)].filter(Boolean);
			expect(hrefs.some((h) => h!.startsWith('/about'))).toBe(false);
		}
	});
});

describe('places and sails', () => {
	it('opens each sail as its own facet', () => {
		FACETS.forEach((f, i) => expect(facetOf('sail', i)).toBe(f.id));
		expect(sailName(0, 'en')).toBe(`${FACETS[0].kanji} ${FACETS[0].title.en}`);
	});

	it('maps each landmark to one facet, and the akabeko to none', () => {
		expect(facetOf('board')).toBe('writer');
		expect(facetOf('tree', 2)).toBe('nature');
		expect(facetOf('hiro')).toBeNull();
	});
});
