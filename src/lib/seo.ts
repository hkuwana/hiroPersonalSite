// Structured data (schema.org JSON-LD) for search engines and answer engines.
// One Person and one WebSite node carry stable @ids, and every page points
// back to them, so the site reads as one connected graph about one person.
import { PERSONAL, SITE, SOCIAL_LINKS } from '$data/constants';

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

type Node = Record<string, unknown>;

// A <script type="application/ld+json"> tag, safe to place with {@html}.
// `<` is escaped, so text such as "</script>" in a title cannot end the tag.
export function jsonLd(data: Node | Node[]): string {
	const body = JSON.stringify(
		Array.isArray(data) ? { '@context': 'https://schema.org', '@graph': data } : data
	).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${body}</script>`;
}

export const absolute = (path: string) => (path.startsWith('http') ? path : `${SITE.url}${path}`);

export const person: Node = {
	'@type': 'Person',
	'@id': PERSON_ID,
	name: 'Hiroyuki (Hiro) Kuwana',
	alternateName: ['Hiro Kuwana', 'Hiroyuki Kuwana', '桑名浩行'],
	url: SITE.url,
	image: SITE.image,
	description: SITE.description,
	jobTitle: 'Founder & Product Designer',
	worksFor: [
		{ '@type': 'Organization', name: 'Kaiwa', url: PERSONAL.companyWebsite },
		{ '@type': 'Organization', name: 'Otterd', url: 'https://otterd.co/' }
	],
	alumniOf: { '@type': 'CollegeOrUniversity', name: 'Brown University' },
	nationality: ['Japanese', 'American'],
	knowsLanguage: ['en', 'ja'],
	knowsAbout: [
		'Artificial Intelligence',
		'Educational Technology',
		'Language Learning',
		'Product Design',
		'Startups'
	],
	sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github, SOCIAL_LINKS.twitter, SOCIAL_LINKS.quora]
};

export const website: Node = {
	'@type': 'WebSite',
	'@id': WEBSITE_ID,
	name: SITE.name,
	url: SITE.url,
	description: SITE.description,
	inLanguage: ['en', 'ja'],
	publisher: { '@id': PERSON_ID },
	author: { '@id': PERSON_ID }
};

// Home › Essays › This essay, for the trail under a search result.
export function breadcrumbs(items: { name: string; path: string }[]): Node {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: absolute(item.path)
		}))
	};
}

export type EssayMeta = { slug: string; title: string; date: string; description: string };

export function blogPosting(e: EssayMeta): Node {
	const url = absolute(`/essays/${e.slug}`);
	return {
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: e.title,
		description: e.description,
		url,
		datePublished: e.date,
		dateModified: e.date,
		inLanguage: 'en',
		image: SITE.image,
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
		mainEntityOfPage: { '@type': 'WebPage', '@id': url }
	};
}

// The essays index: a blog whose posts are the essays, newest first.
export function blog(essays: EssayMeta[]): Node {
	return {
		'@type': 'Blog',
		'@id': `${SITE.url}/essays#blog`,
		name: 'Essays · Hiro Kuwana',
		url: absolute('/essays'),
		inLanguage: 'en',
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
		blogPost: essays.map((e) => ({
			'@type': 'BlogPosting',
			headline: e.title,
			url: absolute(`/essays/${e.slug}`),
			datePublished: e.date,
			author: { '@id': PERSON_ID }
		}))
	};
}

// The home page: a profile of the person, and the projects as a list.
export function homeGraph(projects: { name: string; description: string; url?: string | null }[]) {
	return [
		person,
		website,
		{
			'@type': 'ProfilePage',
			'@id': `${SITE.url}/#profile`,
			url: SITE.url,
			name: SITE.title,
			description: SITE.description,
			isPartOf: { '@id': WEBSITE_ID },
			mainEntity: { '@id': PERSON_ID },
			inLanguage: ['en', 'ja']
		},
		{
			'@type': 'ItemList',
			'@id': `${SITE.url}/#projects`,
			name: 'Projects',
			itemListElement: projects.map((p, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				item: {
					'@type': 'CreativeWork',
					name: p.name,
					description: p.description,
					...(p.url ? { url: p.url } : {}),
					creator: { '@id': PERSON_ID }
				}
			}))
		}
	];
}
