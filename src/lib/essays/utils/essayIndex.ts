import { SITE } from '$data/constants';

export interface EssayMetadata {
	title: string;
	date: string;
	description: string;
	updated?: string;
	status?: 'draft' | 'published';
	category?: 'automation' | 'education' | 'building' | 'essays';
	tags?: string[];
	heroImage?: string;
	featured?: boolean;
}

export interface Essay {
	slug: string;
	metadata: EssayMetadata;
}

interface EssayModule {
	metadata: EssayMetadata;
}

const modules = import.meta.glob<EssayModule>('/src/content/essays/*.md', { eager: true });

function slugFromPath(path: string): string {
	return path.split('/').pop()?.replace('.md', '') ?? '';
}

export interface GetEssaysOptions {
	includeDrafts?: boolean;
}

export function getAllEssays(options: GetEssaysOptions = {}): Essay[] {
	const { includeDrafts = false } = options;
	const essays: Essay[] = [];

	for (const [path, mod] of Object.entries(modules)) {
		const slug = slugFromPath(path);
		if (!slug || slug.startsWith('_')) continue;

		const metadata = mod.metadata;
		if (!metadata) continue;

		const status = metadata.status ?? 'published';
		if (!includeDrafts && status === 'draft') continue;

		essays.push({ slug, metadata });
	}

	essays.sort(
		(a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
	);

	return essays;
}

export interface PaginatedEssays {
	essays: Essay[];
	currentPage: number;
	totalPages: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
}

export function paginate(essays: Essay[], page: number, perPage = 12): PaginatedEssays {
	const totalPages = Math.max(1, Math.ceil(essays.length / perPage));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * perPage;
	const end = start + perPage;

	return {
		essays: essays.slice(start, end),
		currentPage,
		totalPages,
		hasPrevPage: currentPage > 1,
		hasNextPage: currentPage < totalPages
	};
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function generateRss(
	essays: Essay[],
	siteUrl: string = SITE.url,
	extraItems = ''
): string {
	const now = new Date().toUTCString();
	const essayItems = essays
		.map((essay) => {
			const url = `${siteUrl}/essays/${essay.slug}`;
			const pubDate = new Date(essay.metadata.date).toUTCString();
			return `		<item>
			<title>${escapeXml(essay.metadata.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<pubDate>${pubDate}</pubDate>
			<description>${escapeXml(essay.metadata.description)}</description>
		</item>`;
		})
		.join('\n');

	const items = [essayItems, extraItems].filter(Boolean).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(SITE.name)} — Essays &amp; Playbooks</title>
		<link>${siteUrl}/essays</link>
		<description>${escapeXml('Essays and playbooks on AI, automation, and building alone.')}</description>
		<language>en-us</language>
		<lastBuildDate>${now}</lastBuildDate>
		<atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
	</channel>
</rss>`;
}
