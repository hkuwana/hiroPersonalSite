import type { PageLoad } from './$types';

export const prerender = true;

interface GuideMetadata {
	title: string;
	// Optional <title>/og:title text; the visible h1 keeps `title`.
	seoTitle?: string;
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

// Loaded lazily, so the raw markdown is fetched only when this page loads.
const sources = import.meta.glob<string>('/src/content/ai-guides/index.md', {
	query: '?raw',
	import: 'default'
});

// The guide's sections, read from its <h2 id="..."> anchors.
function sections(source: string) {
	return [...source.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(([, id, name]) => ({
		id,
		name: name.replace(/<[^>]+>/g, '').trim()
	}));
}

export const load: PageLoad = async () => {
	const guide = guides['/src/content/ai-guides/index.md'];
	const { default: content, metadata } = guide;

	return {
		content,
		title: metadata.title,
		seoTitle: metadata.seoTitle,
		description: metadata.description,
		updated: metadata.updated,
		sections: sections(await sources['/src/content/ai-guides/index.md']())
	};
};
