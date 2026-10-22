// What the scrolls in the ink village show. Every sentence here comes from
// copy that already lives on the site (facets, constants, essays); only the
// short labels are new. No profile or "about" content: Hiro asked to keep
// the village to the work itself.
import { PROJECTS } from '$data/constants';
import { FACETS, type Facet } from '$lib/home/facets';
import type { PlaceId } from './places';

export type Locale = 'en' | 'ja';
export type FacetId = Facet['id'];
export type Essay = { slug: string; title: string; date: string };
export type ScrollLink = { label: string; href: string; external?: boolean; meta?: string };
export type PlaceContent = {
	facet: FacetId;
	kanji: string;
	place: string;
	title: string;
	line?: string;
	items: ScrollLink[];
	link?: ScrollLink;
};

export const PLACE_NAME: Record<Exclude<PlaceId, 'sail'>, Record<Locale, string>> = {
	windmill: { en: '風車 Windmill', ja: '風車' },
	torii: { en: '鳥居 Torii', ja: '鳥居' },
	board: { en: '高札 Notice board', ja: '高札' },
	tree: { en: '木 Tree', ja: '木' },
	hiro: { en: '赤べこ Akabeko', ja: '赤べこ' }
};

// Which part of the work each place opens. A sail opens its own facet.
export const PLACE_FACET: Record<'windmill' | 'board' | 'torii' | 'tree', FacetId> = {
	windmill: 'builder',
	board: 'writer',
	torii: 'bridge',
	tree: 'nature'
};

export function facetOf(place: PlaceId, index = 0): FacetId | null {
	if (place === 'sail') return FACETS[index]?.id ?? null;
	if (place === 'hiro') return null;
	return PLACE_FACET[place];
}

// The label over a sail: its kanji and its facet, for example "作 Builder".
export function sailName(index: number, lang: Locale): string {
	const f = FACETS[index];
	return f ? `${f.kanji} ${f.title[lang]}` : '';
}

const isAbout = (href: string) => href === '/about' || href.startsWith('/about#');

// Home-page anchors (#work) need the home path from the lab page.
const fromLab = (href: string) => (href.startsWith('#') ? `/${href}` : href);

export function facetContent(
	id: FacetId,
	lang: Locale,
	essays: Essay[] = [],
	place = ''
): PlaceContent {
	const facet = FACETS.find((f) => f.id === id)!;
	const base = {
		facet: id,
		kanji: facet.kanji,
		place,
		title: facet.title[lang],
		line: facet.line[lang],
		link: isAbout(facet.link.href)
			? undefined
			: {
					label: facet.link.label[lang],
					href: fromLab(facet.link.href),
					external: facet.link.external
				}
	};

	switch (id) {
		case 'builder':
			return {
				...base,
				items: PROJECTS.filter((p) => p.status !== 'sunset').map((p) => ({
					label: p.name,
					meta: p.tagline,
					href: ('link' in p && p.link) || ('github' in p && p.github) || '/#work',
					external: true
				}))
			};
		case 'writer':
			return {
				...base,
				items: essays.slice(0, 3).map((e) => ({
					label: e.title,
					meta: new Date(`${e.date}T00:00:00`).toLocaleDateString(
						lang === 'ja' ? 'ja-JP' : 'en-US',
						{ year: 'numeric', month: 'long' }
					),
					href: `/essays/${e.slug}`
				}))
			};
		default:
			return { ...base, items: [] };
	}
}
