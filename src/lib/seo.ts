// Structured data (schema.org JSON-LD) for search engines and answer engines.
// One Person and one WebSite node carry stable @ids, and every page points
// back to them, so the site reads as one connected graph about one person.
import { PERSONAL, PROJECTS, SITE, SOCIAL_LINKS } from '$data/constants';

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const KAIWA_ID = `${SITE.url}/#kaiwa`;
export const OTTERD_ID = `${SITE.url}/#otterd`;

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
	name: 'Hiro Kuwana',
	givenName: 'Hiroyuki',
	familyName: 'Kuwana',
	alternateName: [
		'Hiroyuki (Hiro) Kuwana',
		'Hiroyuki Kuwana',
		'桑名浩行',
		'桑名 浩行'
	],
	url: SITE.url,
	image: SITE.image,
	jobTitle: 'Founder & Product Designer',
	worksFor: [{ '@id': KAIWA_ID }, { '@id': OTTERD_ID }],
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

// The companies, as their own nodes, so the person, the home page and any
// other page can point at one Kaiwa and one Otterd by @id.
const projectDescription = (name: string) => PROJECTS.find((p) => p.name === name)?.description;

function organization(id: string, name: string, url: string, logo: string): Node {
	const description = projectDescription(name);
	return {
		'@type': 'Organization',
		'@id': id,
		name,
		url,
		logo: absolute(logo),
		...(description ? { description } : {}),
		founder: { '@id': PERSON_ID }
	};
}

export const kaiwa: Node = organization(KAIWA_ID, 'Kaiwa', PERSONAL.companyWebsite, '/kaiwa_logo.png');
export const otterd: Node = organization(OTTERD_ID, 'Otterd', 'https://otterd.co/', '/logos/otterd.svg');

const ORGANIZATION_IDS: Record<string, string> = { Kaiwa: KAIWA_ID, Otterd: OTTERD_ID };

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

export type EssayMeta = {
	slug: string;
	title: string;
	date: string;
	description: string;
	// Frontmatter `updated`, when an essay is revised after publishing.
	updated?: string;
	wordCount?: number;
};

export function blogPosting(e: EssayMeta): Node {
	const url = absolute(`/essays/${e.slug}`);
	return {
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: e.title,
		description: e.description,
		url,
		datePublished: e.date,
		dateModified: e.updated || e.date,
		...(e.wordCount ? { wordCount: e.wordCount } : {}),
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

// A long single page (such as /ai-guides) as an Article, with its sections
// listed by anchor so each one can be linked to directly.
export function article(a: {
	headline: string;
	description: string;
	path: string;
	updated: string;
	datePublished?: string;
	sections?: { id: string; name: string }[];
}): Node {
	const url = absolute(a.path);
	return {
		'@type': 'Article',
		'@id': `${url}#article`,
		headline: a.headline,
		description: a.description,
		url,
		...(a.datePublished ? { datePublished: a.datePublished } : {}),
		dateModified: a.updated,
		inLanguage: 'en',
		image: SITE.image,
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		...(a.sections?.length
			? {
					hasPart: a.sections.map((section) => ({
						'@type': 'WebPageElement',
						'@id': `${url}#${section.id}`,
						name: section.name,
						url: `${url}#${section.id}`
					}))
				}
			: {})
	};
}

// A free browser tool on this site.
export function webApplication(app: { name: string; description: string; path: string }): Node {
	const url = absolute(app.path);
	return {
		'@type': 'WebApplication',
		'@id': `${url}#app`,
		name: app.name,
		description: app.description,
		url,
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		author: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID }
	};
}

// The tools index: each tool as a numbered list item pointing at its page.
export function toolsItemList(items: { name: string; path: string }[]): Node {
	return {
		'@type': 'ItemList',
		'@id': `${SITE.url}/tools#list`,
		name: 'Tools',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			url: absolute(item.path)
		}))
	};
}

// The home page: a profile of the person, the companies, and the projects as
// a list. Kaiwa and Otterd are referenced by @id rather than repeated.
export function homeGraph(projects: { name: string; description: string; url?: string | null }[]) {
	return [
		person,
		website,
		kaiwa,
		otterd,
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
				item: ORGANIZATION_IDS[p.name]
					? { '@id': ORGANIZATION_IDS[p.name] }
					: {
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
