import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = true;

interface EssayMetadata {
	title: string;
	date: string;
	description: string;
	// Optional: the date of the last substantive revision.
	updated?: string;
}

interface EssayModule {
	default: ConstructorOfATypedSvelteComponent;
	metadata: EssayMetadata;
}

// Exclude drafts and templates from both direct lookup and prerender entries.
const essays = import.meta.glob(['/src/content/essays/*.md', '!/src/content/essays/_*.md'], {
	eager: true
}) as Record<string, EssayModule>;

// Raw markdown, loaded lazily so only the open essay is fetched.
const sources = import.meta.glob<string>(
	['/src/content/essays/*.md', '!/src/content/essays/_*.md'],
	{ query: '?raw', import: 'default' }
);

// Words in the essay body: frontmatter, code blocks and markup are left out.
function countWords(raw: string): number {
	const text = raw
		.replace(/^---[\s\S]*?\n---/, '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\]\([^)]*\)/g, ']');
	return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
}

export const load: PageLoad = async ({ params }) => {
	const path = `/src/content/essays/${params.slug}.md`;
	const essay = essays[path];

	if (!essay) {
		throw error(404, `Essay not found: ${params.slug}`);
	}

	const { default: content, metadata } = essay;

	// Up to three other essays, newest first, for the list under the essay.
	const moreEssays = Object.entries(essays)
		.filter(([other]) => other !== path)
		.map(([other, { metadata: m }]) => ({
			slug: other.split('/').pop()?.replace('.md', '') || '',
			title: m.title,
			date: m.date,
			description: m.description
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	return {
		content,
		title: metadata.title,
		date: metadata.date,
		updated: metadata.updated,
		description: metadata.description,
		slug: params.slug,
		wordCount: countWords(await sources[path]()),
		moreEssays
	};
};

// Generate entries for prerendering
export const entries = () => {
	return Object.keys(essays).map((path) => ({
		slug: path.split('/').pop()?.replace('.md', '') || ''
	}));
};
