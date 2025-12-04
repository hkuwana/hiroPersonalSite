import type { PageLoad } from './$types';

export const prerender = true;

interface EssayMetadata {
	title: string;
	date: string;
	description: string;
}

interface Essay {
	slug: string;
	title: string;
	date: string;
	description: string;
}

export const load: PageLoad = async () => {
	const essayFiles = import.meta.glob('/src/content/essays/*.md', { eager: true });

	const essays: Essay[] = Object.entries(essayFiles)
		.map(([path, module]) => {
			const slug = path.split('/').pop()?.replace('.md', '') || '';
			const { metadata } = module as { metadata: EssayMetadata };
			return {
				slug,
				title: metadata.title,
				date: metadata.date,
				description: metadata.description
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { essays };
};
