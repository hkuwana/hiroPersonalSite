import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	getAvailableLocales,
	type PlaybookLocale
} from '$lib/playbooks/utils/playbookIndex';

export const prerender = true;

interface PlaybookMetadata {
	title: string;
	date: string;
	description: string;
	summary?: string;
	steps?: { name: string; text: string }[];
	totalTime?: string;
}

interface PlaybookModule {
	default: ConstructorOfATypedSvelteComponent;
	metadata: PlaybookMetadata;
}

const enPlaybooks = import.meta.glob('/src/content/playbooks/en/*.md', {
	eager: true
}) as Record<string, PlaybookModule>;
const jaPlaybooks = import.meta.glob('/src/content/playbooks/ja/*.md', {
	eager: true
}) as Record<string, PlaybookModule>;

const playbooksByLocale: Record<PlaybookLocale, Record<string, PlaybookModule>> = {
	en: enPlaybooks,
	ja: jaPlaybooks
};

function localeFromPath(pathname: string): PlaybookLocale {
	return pathname.startsWith('/ja/') ? 'ja' : 'en';
}

export const load: PageLoad = async ({ params, url }) => {
	const requestedLocale = localeFromPath(url.pathname);
	const tryLocales: PlaybookLocale[] = requestedLocale === 'en' ? ['en'] : ['ja', 'en'];

	let resolved: { module: PlaybookModule; locale: PlaybookLocale } | null = null;
	for (const locale of tryLocales) {
		const path = `/src/content/playbooks/${locale}/${params.slug}.md`;
		const mod = playbooksByLocale[locale][path];
		if (mod) {
			resolved = { module: mod, locale };
			break;
		}
	}

	if (!resolved) {
		throw error(404, `Playbook not found: ${params.slug}`);
	}

	const { default: content, metadata } = resolved.module;
	const availableLocales = getAvailableLocales(params.slug);
	const fellBack = resolved.locale !== requestedLocale;

	return {
		content,
		title: metadata.title,
		date: metadata.date,
		description: metadata.description,
		summary: metadata.summary,
		steps: metadata.steps,
		totalTime: metadata.totalTime,
		slug: params.slug,
		requestedLocale,
		resolvedLocale: resolved.locale,
		availableLocales,
		fellBack
	};
};

export const entries = () => {
	const slugs = new Set<string>();
	for (const path of Object.keys(enPlaybooks)) {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		if (slug && !slug.startsWith('_')) slugs.add(slug);
	}
	for (const path of Object.keys(jaPlaybooks)) {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		if (slug && !slug.startsWith('_')) slugs.add(slug);
	}
	return Array.from(slugs).map((slug) => ({ slug }));
};
