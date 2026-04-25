import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;

interface PlaybookMetadata {
	title: string;
	date: string;
	description: string;
}

interface PlaybookModule {
	default: ConstructorOfATypedSvelteComponent;
	metadata: PlaybookMetadata;
}

const playbooks = import.meta.glob('/src/content/playbooks/*.md', { eager: true }) as Record<
	string,
	PlaybookModule
>;

export const load: PageLoad = async ({ params }) => {
	const path = `/src/content/playbooks/${params.slug}.md`;
	const playbook = playbooks[path];

	if (!playbook) {
		throw error(404, `Playbook not found: ${params.slug}`);
	}

	const { default: content, metadata } = playbook;

	return {
		content,
		title: metadata.title,
		date: metadata.date,
		description: metadata.description,
		slug: params.slug
	};
};

export const entries = () => {
	return Object.keys(playbooks)
		.map((path) => path.split('/').pop()?.replace('.md', '') || '')
		.filter((slug) => slug && !slug.startsWith('_'))
		.map((slug) => ({ slug }));
};
