import { SITE } from '$data/constants';

export type PlaybookLocale = 'en' | 'ja';
export const PLAYBOOK_LOCALES: PlaybookLocale[] = ['en', 'ja'];
export const DEFAULT_PLAYBOOK_LOCALE: PlaybookLocale = 'en';

export interface PlaybookMetadata {
	title: string;
	date: string;
	description: string;
	updated?: string;
	status?: 'draft' | 'published';
	category?: 'automation' | 'education' | 'building' | 'essays';
	tags?: string[];
	heroImage?: string;
	featured?: boolean;
	summary?: string;
	steps?: { name: string; text: string }[];
	totalTime?: string;
}

export interface Playbook {
	slug: string;
	locale: PlaybookLocale;
	metadata: PlaybookMetadata;
}

interface PlaybookModule {
	metadata: PlaybookMetadata;
}

const enModules = import.meta.glob<PlaybookModule>('/src/content/playbooks/en/*.md', {
	eager: true
});
const jaModules = import.meta.glob<PlaybookModule>('/src/content/playbooks/ja/*.md', {
	eager: true
});

const modulesByLocale: Record<PlaybookLocale, Record<string, PlaybookModule>> = {
	en: enModules,
	ja: jaModules
};

function slugFromPath(path: string): string {
	return path.split('/').pop()?.replace('.md', '') ?? '';
}

function isValidSlug(slug: string): boolean {
	return Boolean(slug) && !slug.startsWith('_');
}

export interface GetPlaybooksOptions {
	includeDrafts?: boolean;
	locale?: PlaybookLocale;
}

/**
 * Returns playbooks for the given locale, falling back to the default locale
 * for any slug missing a translation. The returned playbook's `locale` field
 * tells you which file actually backed it.
 */
export function getAllPlaybooks(options: GetPlaybooksOptions = {}): Playbook[] {
	const { includeDrafts = false, locale = DEFAULT_PLAYBOOK_LOCALE } = options;

	// Collect every slug that exists in any locale (so a Japanese visitor can
	// still see English-only playbooks in the index, falling back gracefully).
	const allSlugs = new Set<string>();
	for (const path of Object.keys(enModules)) {
		const slug = slugFromPath(path);
		if (isValidSlug(slug)) allSlugs.add(slug);
	}
	for (const path of Object.keys(jaModules)) {
		const slug = slugFromPath(path);
		if (isValidSlug(slug)) allSlugs.add(slug);
	}

	const playbooks: Playbook[] = [];

	for (const slug of allSlugs) {
		const resolved = resolvePlaybook(slug, locale);
		if (!resolved) continue;

		const status = resolved.metadata.status ?? 'published';
		if (!includeDrafts && status === 'draft') continue;

		playbooks.push(resolved);
	}

	playbooks.sort(
		(a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
	);

	return playbooks;
}

/**
 * Resolves a slug to its metadata for the requested locale, falling back
 * to the default locale if no translation exists. Returns null if the slug
 * doesn't exist in any locale.
 */
export function resolvePlaybook(slug: string, locale: PlaybookLocale): Playbook | null {
	const tryLocales: PlaybookLocale[] = [locale, DEFAULT_PLAYBOOK_LOCALE];
	const seen = new Set<PlaybookLocale>();

	for (const loc of tryLocales) {
		if (seen.has(loc)) continue;
		seen.add(loc);

		const path = `/src/content/playbooks/${loc}/${slug}.md`;
		const mod = modulesByLocale[loc][path];
		if (!mod?.metadata) continue;

		return { slug, locale: loc, metadata: mod.metadata };
	}

	return null;
}

/**
 * Returns the set of locales a slug has translations for. Used to emit
 * accurate hreflang alternates per page.
 */
export function getAvailableLocales(slug: string): PlaybookLocale[] {
	const available: PlaybookLocale[] = [];
	for (const loc of PLAYBOOK_LOCALES) {
		const path = `/src/content/playbooks/${loc}/${slug}.md`;
		if (modulesByLocale[loc][path]?.metadata) available.push(loc);
	}
	return available;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * RSS items for the default-locale playbooks. Per-locale feeds aren't a
 * goal yet — readers can switch via the site's language toggle.
 */
export function generatePlaybookRssItems(
	playbooks: Playbook[],
	siteUrl: string = SITE.url
): string {
	return playbooks
		.map((playbook) => {
			const url = `${siteUrl}/playbooks/${playbook.slug}`;
			const pubDate = new Date(playbook.metadata.date).toUTCString();
			return `		<item>
			<title>${escapeXml(playbook.metadata.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<pubDate>${pubDate}</pubDate>
			<description>${escapeXml(playbook.metadata.description)}</description>
		</item>`;
		})
		.join('\n');
}
