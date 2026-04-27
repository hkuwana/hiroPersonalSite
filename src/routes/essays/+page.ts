import type { PageLoad } from './$types';
import { getAllEssays } from '$lib/essays/utils/essayIndex';

export const prerender = true;

export const load: PageLoad = async () => {
	const essays = getAllEssays({ includeDrafts: import.meta.env.DEV }).map((essay) => ({
		slug: essay.slug,
		title: essay.metadata.title,
		date: essay.metadata.date,
		description: essay.metadata.description,
		isDraft: essay.metadata.status === 'draft'
	}));

	return { essays };
};
