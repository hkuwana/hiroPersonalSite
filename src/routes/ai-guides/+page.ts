import type { PageLoad } from './$types';

export const prerender = true;

interface GuideMetadata {
	title: string;
	description: string;
	updated: string;
}

interface GuideModule {
	default: ConstructorOfATypedSvelteComponent;
	metadata: GuideMetadata;
}

const guides = import.meta.glob('/src/content/ai-guides/index.md', { eager: true }) as Record<
	string,
	GuideModule
>;

export const load: PageLoad = async () => {
	const guide = guides['/src/content/ai-guides/index.md'];
	const { default: content, metadata } = guide;

	return {
		content,
		title: metadata.title,
		description: metadata.description,
		updated: metadata.updated
	};
};
