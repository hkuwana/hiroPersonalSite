import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;

interface EssayMetadata {
	title: string;
	date: string;
	description: string;
}

interface EssayModule {
	default: ConstructorOfATypedSvelteComponent;
	metadata: EssayMetadata;
}

// Eager load all essays at build time
const essays = import.meta.glob('/src/content/essays/*.md', { eager: true }) as Record<
	string,
	EssayModule
>;

export const load: PageLoad = async ({ params }) => {
	const path = `/src/content/essays/${params.slug}.md`;
	const essay = essays[path];

	if (!essay) {
		throw error(404, `Essay not found: ${params.slug}`);
	}

	const { default: content, metadata } = essay;

	return {
		content,
		title: metadata.title,
		date: metadata.date,
		description: metadata.description,
		slug: params.slug
	};
};

// Generate entries for prerendering
export const entries = () => {
	return Object.keys(essays).map((path) => ({
		slug: path.split('/').pop()?.replace('.md', '') || ''
	}));
};
